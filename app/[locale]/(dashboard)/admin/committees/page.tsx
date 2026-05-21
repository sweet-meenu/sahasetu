"use client";

import { useState, useEffect } from "react";
import {
  Building2,
  Search,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  Edit,
  Trash2,
  Users,
  Shield,
  Award,
  MapPin,
  Download,
  Loader2,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import Modal from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

interface Committee {
  id: string;
  name: string;
  organization: string;
  type: "icc" | "lcc";
  members: number;
  presiding: string;
  email: string;
  phone: string;
  location: string;
  status: "active" | "pending" | "expired";
  formationDate: string;
  lastMeeting: string;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return <Badge variant="success">Active</Badge>;
    case "pending":
      return <Badge variant="warning">Pending Setup</Badge>;
    case "expired":
      return <Badge variant="error">Needs Renewal</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

export default function CommitteesPage() {
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [newName, setNewName] = useState("");
  const [newOrg, setNewOrg] = useState("");
  const [newType, setNewType] = useState("icc");
  const [newPresiding, setNewPresiding] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newLocation, setNewLocation] = useState("");

  useEffect(() => {
    fetchCommittees();
  }, [typeFilter, searchQuery]);

  async function fetchCommittees() {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (typeFilter !== "all") query.set("type", typeFilter.toUpperCase());
      if (searchQuery) query.set("search", searchQuery);

      const res = await fetch(`/api/committees?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        const mapped = (data.committees || []).map((c: any) => {
          const presidingOfficer = (c.members || []).find((m: any) => m.role === 'presiding_officer') || c.members?.[0];
          return {
            id: c._id,
            name: c.name,
            organization: c.organizationName,
            type: c.type?.toLowerCase() === "lcc" ? "lcc" : "icc",
            members: c.members?.length || 0,
            presiding: presidingOfficer?.name || "Not Appointed",
            email: c.email,
            phone: c.phone || "N/A",
            location: `${c.district || 'City'}, ${c.state || 'State'}`,
            status: c.isActive ? "active" : "expired",
            formationDate: c.constitutedOn ? new Date(c.constitutedOn).toLocaleDateString() : "N/A",
            lastMeeting: "Recent",
          };
        });
        setCommittees(mapped);
      }
    } catch (e) {
      console.error("Failed to fetch committees:", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddCommittee() {
    if (!newName || !newOrg || !newPresiding || !newEmail) {
      alert("Name, Organization, Presiding Officer, and Email are required.");
      return;
    }
    setSubmitting(true);
    try {
      const presidingMember = {
        userId: "presiding-temp-id",
        name: newPresiding,
        email: newEmail,
        role: 'presiding_officer',
        joinedAt: new Date(),
        isActive: true,
      };

      const body = {
        name: newName,
        type: newType.toUpperCase(),
        organizationName: newOrg,
        email: newEmail,
        phone: newPhone,
        district: newLocation.split(',')[0]?.trim() || newLocation || "District",
        state: newLocation.split(',')[1]?.trim() || "State",
        constitutedOn: new Date(),
        validUntil: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000), // 3 years
        isConstitutedAsPerAct: true,
        hasExternalMember: true,
        hasWomenMajority: true,
        isActive: true,
        members: [presidingMember],
      };

      const res = await fetch("/api/committees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setNewName("");
        setNewOrg("");
        setNewType("icc");
        setNewPresiding("");
        setNewEmail("");
        setNewPhone("");
        setNewLocation("");
        setShowAddModal(false);
        fetchCommittees();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create committee.");
      }
    } catch (err) {
      console.error("Error creating committee:", err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteCommittee(id: string) {
    if (!confirm("Are you sure you want to delete this committee permanently?")) return;
    try {
      const res = await fetch(`/api/committees/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchCommittees();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete committee.");
      }
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Building2 className="w-8 h-8 text-primary-600" />
            Committees
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage Internal and Local Complaints Committees dynamically
          </p>
        </div>
        <div className="flex gap-3">
          <Button leftIcon={<UserPlus className="w-4 h-4" />} onClick={() => setShowAddModal(true)}>
            Add Committee
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total ICCs", value: committees.filter(c => c.type === "icc").length, icon: Shield, color: "bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400" },
          { label: "Total LCCs", value: committees.filter(c => c.type === "lcc").length, icon: Building2, color: "bg-secondary-100 dark:bg-secondary-900/30 text-secondary-600 dark:text-secondary-400" },
          { label: "Active", value: committees.filter(c => c.status === "active").length, icon: CheckCircle, color: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" },
          { label: "Total Members", value: committees.reduce((acc, c) => acc + c.members, 0), icon: Users, color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="flex items-center gap-4 py-4">
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <Input
              placeholder="Search committees by name or organization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-5 h-5" />}
            />
          </div>
          <Select
            options={[
              { value: "all", label: "All Types" },
              { value: "icc", label: "ICC" },
              { value: "lcc", label: "LCC" },
            ]}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-48"
          />
        </CardContent>
      </Card>

      {/* Committees Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {committees.map((committee) => (
            <Card key={committee.id} hover>
              <CardContent>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      committee.type === "icc" ? "bg-primary-100 dark:bg-primary-900/30" : "bg-secondary-100 dark:bg-secondary-900/30"
                    )}>
                      {committee.type === "icc" ? (
                        <Shield className="w-6 h-6 text-primary-600" />
                      ) : (
                        <Building2 className="w-6 h-6 text-secondary-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {committee.name}
                      </h3>
                      <p className="text-sm text-gray-500">{committee.organization}</p>
                    </div>
                  </div>
                  {getStatusBadge(committee.status)}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Presiding Officer</p>
                    <div className="flex items-center gap-2">
                      <Avatar name={committee.presiding} size="xs" />
                      <span className="text-sm font-medium">{committee.presiding}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Members</p>
                    <p className="text-sm font-medium">{committee.members} members</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {committee.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    Formation Date: {committee.formationDate}
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <a href={`mailto:${committee.email}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Mail className="w-4 h-4 mr-1" />
                      Email
                    </Button>
                  </a>
                  <button
                    onClick={() => handleDeleteCommittee(committee.id)}
                    className="flex-1 py-1.5 border border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20 text-error rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors text-sm font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
          {committees.length === 0 && (
            <div className="col-span-2 text-center py-12 text-gray-500">
              No committees found.
            </div>
          )}
        </div>
      )}

      {/* Add Committee Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Committee"
        description="Register a new ICC or LCC under PoSH compliance Guidelines"
      >
        <div className="space-y-4">
          <Input
            label="Committee Name"
            placeholder="e.g., TechCorp ICC"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Input
            label="Organization"
            placeholder="Organization name"
            value={newOrg}
            onChange={(e) => setNewOrg(e.target.value)}
          />
          <Select
            label="Type"
            options={[
              { value: "icc", label: "Internal Complaints Committee (ICC)" },
              { value: "lcc", label: "Local Complaints Committee (LCC)" },
            ]}
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
          />
          <Input
            label="Presiding Officer"
            placeholder="Name of presiding officer"
            value={newPresiding}
            onChange={(e) => setNewPresiding(e.target.value)}
          />
          <Input
            label="Email"
            type="email"
            placeholder="icc@organization.com"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
          <Input
            label="Phone (Optional)"
            placeholder="+91 XX XXXX XXXX"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
          />
          <Input
            label="Location"
            placeholder="District, State (e.g. Pune, Maharashtra)"
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
          />
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1 cursor-pointer" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button className="flex-1 cursor-pointer" onClick={handleAddCommittee} disabled={submitting}>
              {submitting ? "Registering..." : "Create Committee"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
