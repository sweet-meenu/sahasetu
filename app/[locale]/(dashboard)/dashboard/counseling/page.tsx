"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  MessageCircle,
  Phone,
  Video,
  Calendar,
  Clock,
  Star,
  Shield,
  Search,
  Filter,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  User,
  Globe,
  Award,
  Heart,
  Mic,
  MicOff,
  Loader2,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import Toggle from "@/components/ui/Toggle";
import { cn } from "@/lib/utils";

interface Counselor {
  _id: string;        // real DB _id used for booking
  id: string;         // same as _id, kept for map key compat
  name: string;
  title: string;
  specialization: string[];
  languages: string[];
  rating: number;
  reviews: number;
  experience: string;
  available: boolean;
  nextSlot?: string;
}

// Fallback UI data merged with real DB records
const FALLBACK_EXTRAS: Record<string, Partial<Counselor>> = {};

interface Session {
  _id: string;
  counselor?: { name: string };
  counselorName?: string;
  scheduledAt: string;
  type: string;
  status: string;
  duration?: number;
  notes?: string;
}

export default function CounselingPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCounselor, setSelectedCounselor] = useState<Counselor | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"counselors" | "upcoming" | "past">("counselors");
  const [voiceDistortion, setVoiceDistortion] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [bookingType, setBookingType] = useState("video");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");

  useEffect(() => {
    fetchSessions();
    fetchCounselors();
  }, []);

  async function fetchCounselors() {
    try {
      const res = await fetch("/api/counseling/counselors");
      if (res.ok) {
        const data = await res.json();
        // Map DB users into the Counselor UI shape
        const mapped: Counselor[] = (data.counselors || []).map((u: any) => ({
          _id: u._id,
          id: u._id,
          name: u.name,
          title: u.organization || "Counselor",
          specialization: u.specialization?.length ? u.specialization : ["Workplace Support", "Trauma"],
          languages: u.languages?.length ? u.languages : ["English"],
          rating: u.rating || 5.0,
          reviews: 0,
          experience: u.experience || "Verified Professional",
          available: true,
        }));
        setCounselors(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch counselors:", err);
    }
  }

  async function fetchSessions() {
    try {
      setLoading(true);
      const res = await fetch("/api/counseling");
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      }
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleBookSession() {
    if (!selectedCounselor || !bookingDate || !bookingTime) return;
    setBooking(true);
    try {
      const scheduledAt = new Date(`${bookingDate}T${bookingTime}`).toISOString();
      const res = await fetch("/api/counseling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          counselorId: selectedCounselor._id,   // ← real DB _id
          type: bookingType,
          scheduledAt,
          voiceDistortion: bookingType === "voice" ? voiceDistortion : undefined,
          notes: `Session with ${selectedCounselor.name}`,
        }),
      });
      if (res.ok) {
        setShowBookingModal(false);
        setBookingDate("");
        setBookingTime("");
        fetchSessions();
      }
    } catch (err) {
      console.error("Booking failed:", err);
    } finally {
      setBooking(false);
    }
  }

  async function handleRescheduleSession() {
    if (!selectedSession || !bookingDate || !bookingTime) return;
    setBooking(true);
    try {
      const scheduledAt = new Date(`${bookingDate}T${bookingTime}`).toISOString();
      const res = await fetch(`/api/counseling/${selectedSession._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduledAt }),
      });
      if (res.ok) {
        setShowRescheduleModal(false);
        setBookingDate("");
        setBookingTime("");
        fetchSessions();
      }
    } catch (err) {
      console.error("Rescheduling failed:", err);
    } finally {
      setBooking(false);
    }
  }

  const upcomingSessions = sessions.filter(
    (s) => s.status === "scheduled" || s.status === "confirmed"
  );
  const pastSessions = sessions.filter(
    (s) => s.status === "completed" || s.status === "cancelled"
  );

  const filteredCounselors = counselors.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.specialization.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <MessageCircle className="w-8 h-8 text-primary-600" />
            Counseling & Support
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Connect with certified counselors for emotional and legal support
          </p>
        </div>
      </div>

      {/* Privacy Banner */}
      <Card className="bg-gradient-to-r from-accent-600 to-accent-700 text-white border-0">
        <CardContent className="flex flex-col md:flex-row items-center gap-4 py-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="font-semibold">Confidential & Secure Sessions</h3>
            <p className="text-sm text-accent-100">
              All sessions are encrypted. Voice distortion available for call sessions to protect your identity.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5" />
            <Toggle
              checked={voiceDistortion}
              onChange={setVoiceDistortion}
              size="sm"
            />
            <MicOff className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {[
          { id: "counselors", label: "Find Counselors", icon: User },
          { id: "upcoming", label: "Upcoming Sessions", icon: Calendar },
          { id: "past", label: "Past Sessions", icon: Clock },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
              activeTab === tab.id
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "counselors" && (
        <>
          {/* Search */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search counselors by name or specialization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-5 h-5" />}
              />
            </div>
          </div>

          {/* Counselors Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {filteredCounselors.map((counselor) => (
              <Card key={counselor.id} hover className="group">
                <CardContent>
                  <div className="flex gap-4">
                    <Avatar name={counselor.name} size="xl" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {counselor.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {counselor.title}
                          </p>
                        </div>
                        <Badge
                          variant={counselor.available ? "success" : "default"}
                          size="sm"
                        >
                          {counselor.available ? "Available" : "Busy"}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-warning fill-warning" />
                          <span className="text-sm font-medium">
                            {counselor.rating}
                          </span>
                          <span className="text-sm text-gray-500">
                            ({counselor.reviews})
                          </span>
                        </div>
                        <span className="text-gray-300">•</span>
                        <span className="text-sm text-gray-500">
                          {counselor.experience}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {counselor.specialization.map((spec, i) => (
                        <Badge key={i} variant="secondary" size="sm">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Globe className="w-4 h-4" />
                      {counselor.languages.join(", ")}
                    </div>
                  </div>

                  {counselor.nextSlot && (
                    <div className="flex items-center gap-2 mt-3 p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                      <Clock className="w-4 h-4 text-primary-600" />
                      <span className="text-sm text-primary-600 font-medium">
                        Next available: {counselor.nextSlot}
                      </span>
                    </div>
                  )}

                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      leftIcon={<MessageCircle className="w-4 h-4" />}
                    >
                      Chat
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      leftIcon={<Phone className="w-4 h-4" />}
                    >
                      Call
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      leftIcon={<Calendar className="w-4 h-4" />}
                      onClick={() => {
                        setSelectedCounselor(counselor);
                        setShowBookingModal(true);
                      }}
                    >
                      Book
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {activeTab === "upcoming" && (
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
          ) : upcomingSessions.length > 0 ? (
            upcomingSessions.map((session) => (
              <Card key={session._id}>
                <CardContent className="flex flex-col md:flex-row md:items-center gap-4">
                  <Avatar name={session.counselorName || "Counselor"} size="lg" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {session.counselorName || "Assigned Counselor"}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(session.scheduledAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(session.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <Badge variant="info" size="sm">
                        <Video className="w-3 h-3 mr-1" />
                        {session.type === "video" ? "Video Call" : session.type === "voice" ? "Voice Call" : "Chat"}
                      </Badge>
                      <Badge variant="success" size="sm">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {session.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => {
                      setSelectedSession(session);
                      setShowRescheduleModal(true);
                    }}>
                      Reschedule
                    </Button>
                    <Button size="sm" leftIcon={<Video className="w-4 h-4" />} onClick={() => router.push(`/dashboard/counseling/room?id=${session._id}&type=${session.type}`)}>
                      Join Session
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  No upcoming sessions
                </h3>
                <p className="text-gray-500 mb-4">
                  Book a session with one of our certified counselors
                </p>
                <Button onClick={() => setActiveTab("counselors")}>
                  Find Counselors
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === "past" && (
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
          ) : pastSessions.length > 0 ? (
            pastSessions.map((session) => (
              <Card key={session._id}>
                <CardContent className="flex flex-col md:flex-row md:items-center gap-4">
                  <Avatar name={session.counselorName || "Counselor"} size="lg" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {session.counselorName || "Counselor"}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(session.scheduledAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {session.duration ? `${session.duration} min` : "N/A"}
                      </span>
                      <Badge variant="default" size="sm">
                        {session.type === "video" ? "Video Call" : session.type === "voice" ? "Voice Call" : "Chat"}
                      </Badge>
                    </div>
                    {session.notes && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
                        {session.notes}
                      </p>
                    )}
                  </div>
                  <Button variant="outline" size="sm">
                    Book Again
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  No past sessions
                </h3>
                <p className="text-gray-500">Your completed sessions will appear here</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Booking Modal */}
      <Modal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        title={`Book Session with ${selectedCounselor?.name}`}
        description="Choose your preferred date, time, and session type"
      >
        <div className="space-y-4">
          <Select
            label="Session Type"
            options={[
              { value: "video", label: "Video Call" },
              { value: "voice", label: "Voice Call (with distortion)" },
              { value: "chat", label: "Text Chat" },
            ]}
            value={bookingType}
            onChange={(e) => setBookingType(e.target.value)}
          />

          <Input label="Preferred Date" type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} />

          <Select
            label="Preferred Time"
            options={[
              { value: "09:00", label: "9:00 AM" },
              { value: "10:00", label: "10:00 AM" },
              { value: "11:00", label: "11:00 AM" },
              { value: "14:00", label: "2:00 PM" },
              { value: "15:00", label: "3:00 PM" },
              { value: "16:00", label: "4:00 PM" },
            ]}
            placeholder="Select time slot"
            value={bookingTime}
            onChange={(e) => setBookingTime(e.target.value)}
          />

          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="flex gap-3 py-3">
              <Shield className="w-5 h-5 text-info shrink-0" />
              <p className="text-sm text-blue-700 dark:text-blue-300">
                All sessions are completely confidential and encrypted. Voice distortion is enabled by default for calls.
              </p>
            </CardContent>
          </Card>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowBookingModal(false)}
            >
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleBookSession} disabled={booking || !bookingDate || !bookingTime}>
              {booking ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Calendar className="w-4 h-4 mr-2" />}
              {booking ? "Booking..." : "Confirm Booking"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reschedule Modal */}
      <Modal
        isOpen={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        title="Reschedule Session"
        description="Choose a new date and time for your session"
      >
        <div className="space-y-4">
          <Input
            label="New Date"
            type="date"
            value={bookingDate}
            onChange={(e) => setBookingDate(e.target.value)}
          />
          <Input
            label="New Time"
            type="time"
            value={bookingTime}
            onChange={(e) => setBookingTime(e.target.value)}
          />
          <div className="pt-4 flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowRescheduleModal(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleRescheduleSession}
              isLoading={booking}
            >
              Reschedule
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
