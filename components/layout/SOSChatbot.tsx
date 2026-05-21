"use client";

import { cn } from "@/lib/utils";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  Phone,
  AlertTriangle,
  Loader2,
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import Button from "../ui/Button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const quickActions = [
  { label: "I need emotional support", icon: "💙" },
  { label: "Help me report an incident", icon: "📝" },
  { label: "Know my rights under PoSH", icon: "⚖️" },
  { label: "Connect to a counselor", icon: "👩‍⚕️" },
];

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content:
      "Hello, I'm here to support you. This is a safe space. How can I help you today? Remember, your privacy is protected at all times.",
    timestamp: new Date(),
  },
];

export default function SOSChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          // Auto-send when speaking stops
          setTimeout(() => handleSend(transcript), 500);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  const toggleLiveMode = () => {
    if (!isLiveMode) {
      if (!recognitionRef.current) {
        alert("Speech recognition isn't supported in this browser.");
        return;
      }
      setIsLiveMode(true);
      startListening();
    } else {
      setIsLiveMode(false);
      stopListening();
      if (synthRef.current) synthRef.current.cancel();
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      setIsListening(false);
      recognitionRef.current.stop();
    }
  };

  const speak = (text: string) => {
    if (!synthRef.current || !isLiveMode) return;
    synthRef.current.cancel();
    // Simply strip basic markdown like ** and * for spoken text
    const cleanText = text.replace(/[*#_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.onend = () => {
      // Start listening again after AI finishes speaking in live mode
      if (isLiveMode && isOpen) {
        startListening();
      }
    };
    synthRef.current.speak(utterance);
  };

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() || isTyping) return;

    if (isListening) stopListening();

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    try {
      // Extract just role and content for the API request
      const apiMessages = newMessages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!res.ok) throw new Error("API failed");
      
      const data = await res.json();
      
      if (data.reply) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.reply,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        if (isLiveMode) speak(data.reply);
      } else {
        throw new Error(data.error || "No reply from AI");
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errText = "I'm having trouble connecting right now. If this is an emergency, please call 181 immediately. Otherwise, please try again in a moment.";
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: errText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      if (isLiveMode) speak(errText);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = (action: string) => {
    handleSend(action);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30 flex items-center justify-center hover:shadow-xl hover:shadow-primary-500/40 transition-all hover:scale-105",
          isOpen && "hidden"
        )}
        aria-label="Open support chat"
      >
        <MessageCircle className="w-6 h-6 md:w-7 md:h-7" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full animate-pulse" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50 w-full sm:w-96 h-full sm:h-[600px] sm:max-h-[80vh] bg-white dark:bg-gray-900 sm:rounded-2xl shadow-2xl flex flex-col animate-slide-up overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">SOS Support</h3>
                  <div className="flex items-center gap-1 text-xs text-primary-100">
                    <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                    <span>Always available by Google Gemini AI</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={toggleLiveMode}
                  className={cn(
                    "p-2 rounded-lg transition-colors flex items-center gap-2 text-sm",
                    isLiveMode ? "bg-white/20 hover:bg-white/30 text-white font-medium" : "hover:bg-white/10"
                  )}
                  title="Toggle Live Voice Mode"
                >
                  {isLiveMode ? (
                    <>
                      <Volume2 className="w-4 h-4 animate-pulse" />
                      Live Mode
                    </>
                  ) : (
                    <VolumeX className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Emergency Options */}
            <div className="flex gap-2 mt-3">
              <a
                href="tel:181"
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
              >
                <Phone className="w-4 h-4" />
                Call 181
              </a>
              <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-error/80 hover:bg-error rounded-lg text-sm font-medium transition-colors">
                <AlertTriangle className="w-4 h-4" />
                Emergency
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.role === "user" && "flex-row-reverse"
                )}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[85%] p-3 rounded-2xl text-sm",
                    message.role === "user"
                      ? "bg-primary-600 text-white rounded-br-md"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-md"
                  )}
                >
                  {message.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-ol:pl-4 prose-ul:pl-4 prose-li:my-0">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    message.content
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-2xl rounded-bl-md">
                  <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 2 && (
            <div className="px-4 pb-2">
              <p className="text-xs text-gray-500 mb-2">Quick actions:</p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleQuickAction(action.label)}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs rounded-full hover:bg-primary-100 hover:text-primary-600 dark:hover:bg-primary-900 dark:hover:text-primary-400 transition-colors"
                  >
                    <span className="mr-1">{action.icon}</span>
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 relative">
            {isListening && (
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-error text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg animate-bounce">
                <Mic className="w-3 h-3 animate-pulse" /> Listening...
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={isListening ? stopListening : startListening}
                className={cn(
                  "w-10 h-10shrink-0 rounded-xl flex items-center justify-center transition-colors shadow-sm",
                  isListening 
                    ? "bg-error text-white animate-pulse" 
                    : "bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200"
                )}
                title="Use Microphone"
              >
                {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={isLiveMode ? "Listening or type..." : "Type your message..."}
                disabled={isLiveMode && isListening}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
              />
              <Button
                onClick={() => handleSend()}
                disabled={(!input.trim() && !isListening) || isTyping}
                size="sm"
                className="px-4 shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-400 text-center mt-3">
              🔒 End-to-end encrypted • Powered by Gemini 2.5
            </p>
          </div>
        </div>
      )}
    </>
  );
}
