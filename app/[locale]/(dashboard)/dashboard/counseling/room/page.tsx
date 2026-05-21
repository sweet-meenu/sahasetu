"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Video, 
  Phone, 
  MessageSquare, 
  Mic, 
  MicOff, 
  VideoOff, 
  PhoneOff,
  Settings,
  X,
  Volume2
} from "lucide-react";
import Button from "@/components/ui/Button";

export default function CounselingRoomPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "video";
  const id = searchParams.get("id");

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    // In a real app we would establish WebRTC/Twilio connection here based on the `id`
    console.log(`Connecting to session ${id} of type ${type}`);
    
    // Timer
    const interval = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [id, type]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLeave = () => {
    // In a real app we'd dispatch a status update to the backend `/api/counseling/:id`
    router.push("/dashboard/counseling");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-gray-950 rounded-2xl overflow-hidden relative shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-800 text-white z-10">
        <div className="flex items-center gap-3">
          {type === 'video' ? <Video className="w-5 h-5 text-green-400" /> : 
           type === 'voice' ? <Phone className="w-5 h-5 text-green-400" /> : 
           <MessageSquare className="w-5 h-5 text-green-400" />}
          <div>
            <h2 className="font-semibold leading-tight">Anonymous Support Session</h2>
            <p className="text-xs text-gray-400">End-to-End Encrypted</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="font-mono text-sm tracking-wider bg-gray-800 px-3 py-1 rounded-md">
            {formatTime(timeElapsed)}
          </div>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 bg-gray-950 flex flex-col relative items-center justify-center p-6">
        
        {type === 'video' && (
          <div className="w-full h-full max-w-4xl mx-auto flex flex-col md:flex-row gap-4">
            {/* Counselor Video (Placeholder) */}
            <div className="flex-1 bg-gray-900 rounded-xl border border-gray-800 flex items-center justify-center relative overflow-hidden">
               <div className="absolute inset-0 flex flex-col items-center justify-center animate-pulse">
                 <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                   <UserPlaceholder />
                 </div>
                 <p className="text-gray-500 font-medium tracking-wide">Waiting for counselor to join...</p>
               </div>
               <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-md text-white text-sm">
                 Counselor Video
               </div>
            </div>

            {/* User Video (Placeholder) */}
            <div className="w-full md:w-64 h-48 md:h-auto bg-gray-900 rounded-xl border border-gray-800 flex items-center justify-center relative overflow-hidden shrink-0">
               {isVideoOff ? (
                 <div className="flex flex-col items-center justify-center">
                   <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-2">
                     <VideoOff className="w-6 h-6 text-gray-500" />
                   </div>
                   <p className="text-xs text-gray-500">Video Off</p>
                 </div>
               ) : (
                 <div className="flex flex-col items-center justify-center">
                   <UserPlaceholder className="opacity-20" />
                   <p className="text-xs text-gray-500 mt-2">Your Camera (Simulated)</p>
                 </div>
               )}
               <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-md text-white text-xs">
                 You
               </div>
            </div>
          </div>
        )}

        {type === 'voice' && (
          <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto">
            <div className="w-32 h-32 rounded-full bg-primary-900/40 border-4 border-primary-500 flex items-center justify-center mb-8 relative">
               <div className="absolute inset-0 rounded-full bg-primary-500/20 animate-ping" />
               <Phone className="w-12 h-12 text-primary-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Secure Voice Call</h3>
            <p className="text-gray-400 text-center text-sm">
              Your voice is currently being anonymized securely. The counselor cannot identify you.
            </p>
            
            <div className="mt-12 flex items-center gap-4 bg-gray-900 px-6 py-3 rounded-full border border-gray-800">
              <Volume2 className="w-5 h-5 text-gray-400" />
              <div className="w-32 h-1 bg-gray-800 rounded-full overflow-hidden flex">
                <div className="h-full bg-green-500 w-1/3 animate-pulse" />
              </div>
            </div>
          </div>
        )}

        {type === 'chat' && (
          <div className="w-full h-full max-w-2xl mx-auto flex flex-col bg-gray-900 border border-gray-800 rounded-xl">
             <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="flex justify-center">
                  <span className="text-xs bg-gray-800 text-gray-400 px-3 py-1 rounded-full">
                    Connection encrypted • {new Date().toLocaleDateString()}
                  </span>
                </div>
                
                {/* Chat Bubbles */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center shrink-0">
                    <UserPlaceholder />
                  </div>
                  <div className="bg-gray-800 rounded-2xl rounded-tl-none px-4 py-2 text-sm text-gray-200 border border-gray-700 max-w-[80%]">
                    Hello, I'm your counselor. How can I support you today? You're completely safe and anonymous here.
                  </div>
                </div>
             </div>
             
             <div className="p-4 bg-gray-900 border-t border-gray-800">
               <div className="flex gap-2 relative">
                 <input 
                   type="text" 
                   className="w-full bg-gray-800 border border-gray-700 rounded-full px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                   placeholder="Type a secure message..."
                 />
                 <Button className="rounded-full px-6">Send</Button>
               </div>
             </div>
          </div>
        )}

      </div>

      {/* Controls Bar */}
      <div className="bg-gray-900 border-t border-gray-800 p-4 flex items-center justify-center gap-4 z-10">
        
        {type !== 'chat' && (
          <>
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                isMuted ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {type === 'video' && (
              <button 
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  isVideoOff ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-gray-800 text-white hover:bg-gray-700'
                }`}
              >
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>
            )}
          </>
        )}

        <button 
          onClick={handleLeave}
          className="w-16 h-12 rounded-full flex items-center justify-center bg-red-600 hover:bg-red-700 text-white transition-colors"
        >
          <PhoneOff className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function UserPlaceholder({ className }: { className?: string }) {
  return (
    <svg className={`w-8 h-8 text-gray-500 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}
