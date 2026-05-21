"use client";

import { useState } from "react";
import {
  Users,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  Building2,
  Shield,
  Edit,
  Trash2,
  Search,
  ChevronRight,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Avatar from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";

export default function PartnerCommitteePage() {
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);

  const committeeInfo = {
    name: "Internal Complaints Committee (ICC)",
    organization: "Women's Rights Foundation",
    formationDate: "2024-01-15",
    validUntil: "2027-01-14",
    totalMembers: 7,
    minRequired: 4,
    status: "active",
  };

  const members = [
    {
      id: 1,
      name: "Dr. Anita Sharma",
      role: "Presiding Officer",
      designation: "Senior Director",
      email: "anita.sharma@org.com",
      phone: "+91 98765 43210",
      joinedDate: "2024-01-15",
      status: "active",
      isExternal: false,
    },
    {
      id: 2,
      name: "Rajesh Kumar",
      role: "External Member",
      designation: "Advocate, High Court",
      email: "rajesh.kumar@legal.com",
      phone: "+91 98765 43211",
      joinedDate: "2024-01-15",
      status: "active",
      isExternal: true,
    },
    {
      id: 3,
      name: "Priya Menon",
      role: "Senior Member",
      designation: "HR Manager",
      email: "priya.menon@org.com",
      phone: "+91 98765 43212",
      joinedDate: "2024-02-01",
      status: "active",
      isExternal: false,
    },
    {
      id: 4,
      name: "Sunita Desai",
      role: "Member",
      designation: "Program Coordinator",
      email: "sunita.desai@org.com",
      phone: "+91 98765 43213",
      joinedDate: "2024-02-01",
      status: "on-leave",
      isExternal: false,
    },
    {
      id: 5,
      name: "Kavitha Nair",
      role: "Member",
      designation: "Social Worker",
      email: "kavitha.nair@org.com",
      phone: "+91 98765 43214",
      joinedDate: "2024-03-15",
      status: "active",
      isExternal: false,
    },
    {
      id: 6,
      name: "Meera Iyer",
      role: "Member",
      designation: "Counselor",
      email: "meera.iyer@org.com",
      phone: "+91 98765 43215",
      joinedDate: "2024-03-15",
      status: "active",
      isExternal: false,
    },
    {
      id: 7,
      name: "Dr. Rekha Joshi",
      role: "External Member",
      designation: "Psychologist",
      email: "rekha.joshi@clinic.com",
      phone: "+91 98765 43216",
      joinedDate: "2024-04-01",
      status: "active",
      isExternal: true,
    },
  ];

  const recentActivities = [
    {
      id: 1,
      action: "Committee meeting held",
      date: "2026-02-05",
      details: "Monthly review meeting - 5 cases discussed",
    },
    {
      id: 2,
      action: "Member added",
      date: "2026-01-20",
      details: "Dr. Rekha Joshi joined as External Member",
    },
    {
      id: 3,
      action: "Case resolved",
      date: "2026-01-18",
      details: "Case #2024-039 closed with recommendations",
    },
    {
      id: 4,
      action: "Training conducted",
      date: "2026-01-10",
      details: "PoSH awareness training for all members",
    },
  ];

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "success" | "warning" | "error"; label: string }> = {
      active: { variant: "success", label: "Active" },
      "on-leave": { variant: "warning", label: "On Leave" },
      inactive: { variant: "error", label: "Inactive" },
    };
    const { variant, label } = config[status] || { variant: "success", label: status };
    return <Badge variant={variant} size="sm">{label}</Badge>;
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Committee
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage Internal Complaints Committee members
          </p>
        </div>
        <Button leftIcon={<UserPlus className="w-4 h-4" />} onClick={() => setShowAddMemberModal(true)}>
          Add Member
        </Button>
      </div>

      {/* Committee Info Card */}
      <Card className="mb-6 bg-gradient-to-r from-secondary-50 to-secondary-100 dark:from-secondary-900/30 dark:to-secondary-800/30 border-secondary-200 dark:border-secondary-800">
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-secondary-600 rounded-xl flex items-center justify-center text-white">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {committeeInfo.name}
                </h2>
                <p className="text-secondary-600 font-medium">{committeeInfo.organization}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Valid until: {committeeInfo.validUntil}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-secondary-600">{committeeInfo.totalMembers}</p>
                <p className="text-sm text-gray-500">Members</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">
                  {members.filter(m => m.status === "active").length}
                </p>
                <p className="text-sm text-gray-500">Active</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">
                  {members.filter(m => m.isExternal).length}
                </p>
                <p className="text-sm text-gray-500">External</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Members List */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Committee Members</CardTitle>
              <Input
                placeholder="Search members..."
                leftIcon={<Search className="w-4 h-4" />}
                className="w-64"
              />
            </CardHeader>
            <CardContent className="space-y-4">
              {members.map((member) => (
                <div
                  key={member.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl border transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800",
                    member.role === "Presiding Officer"
                      ? "border-secondary-200 bg-secondary-50/50 dark:border-secondary-800 dark:bg-secondary-900/20"
                      : "border-gray-200 dark:border-gray-700"
                  )}
                  onClick={() => setSelectedMember(member)}
                >
                  <div className="flex items-center gap-4">
                    <Avatar name={member.name} size="md" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{member.name}</p>
                        {member.isExternal && (
                          <Badge variant="secondary" size="sm">External</Badge>
                        )}
                        {getStatusBadge(member.status)}
                      </div>
                      <p className="text-sm text-secondary-600 font-medium">{member.role}</p>
                      <p className="text-xs text-gray-500">{member.designation}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Mail className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Compliance Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Compliance Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium">Minimum Members</span>
                </div>
                <Badge variant="success" size="sm">Met</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium">External Member</span>
                </div>
                <Badge variant="success" size="sm">Present</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium">Female Majority</span>
                </div>
                <Badge variant="success" size="sm">Yes</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium">Presiding Officer</span>
                </div>
                <Badge variant="success" size="sm">Appointed</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0">
                  <div className="w-2 h-2 bg-secondary-500 rounded-full mt-2" />
                  <div>
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.details}</p>
                    <p className="text-xs text-gray-400 mt-1">{activity.date}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" leftIcon={<Calendar className="w-4 h-4" />}>
                Schedule Meeting
              </Button>
              <Button variant="outline" className="w-full justify-start" leftIcon={<Mail className="w-4 h-4" />}>
                Send Notification
              </Button>
              <Button variant="outline" className="w-full justify-start" leftIcon={<Users className="w-4 h-4" />}>
                View All Members
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Member Modal */}
      <Modal
        isOpen={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
        title="Add Committee Member"
        size="md"
      >
        <div className="space-y-4">
          <Input label="Full Name" placeholder="Enter member's full name" />
          <Input label="Email" type="email" placeholder="Enter email address" />
          <Input label="Phone" type="tel" placeholder="Enter phone number" />
          <Input label="Designation" placeholder="Enter job title / designation" />
          <Select
            label="Role"
            options={[
              { value: "member", label: "Member" },
              { value: "senior", label: "Senior Member" },
              { value: "external", label: "External Member" },
              { value: "presiding", label: "Presiding Officer" },
            ]}
          />
          <Select
            label="Member Type"
            options={[
              { value: "internal", label: "Internal (Organization Employee)" },
              { value: "external", label: "External (Partner / Legal Expert)" },
            ]}
          />
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => setShowAddMemberModal(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={() => setShowAddMemberModal(false)}>
              Add Member
            </Button>
          </div>
        </div>
      </Modal>

      {/* Member Detail Modal */}
      <Modal
        isOpen={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        title="Member Details"
        size="md"
      >
        {selectedMember && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Avatar name={selectedMember.name} size="lg" />
              <div>
                <p className="font-semibold text-lg">{selectedMember.name}</p>
                <p className="text-secondary-600 font-medium">{selectedMember.role}</p>
                <div className="flex items-center gap-2 mt-1">
                  {selectedMember.isExternal && (
                    <Badge variant="secondary" size="sm">External</Badge>
                  )}
                  {getStatusBadge(selectedMember.status)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-500">Designation</p>
                <p className="font-medium">{selectedMember.designation}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-500">Joined Date</p>
                <p className="font-medium">{selectedMember.joinedDate}</p>
              </div>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Email</p>
              <p className="font-medium">{selectedMember.email}</p>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Phone</p>
              <p className="font-medium">{selectedMember.phone}</p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" leftIcon={<Edit className="w-4 h-4" />}>
                Edit
              </Button>
              <Button variant="outline" className="flex-1 text-red-600 hover:bg-red-50" leftIcon={<Trash2 className="w-4 h-4" />}>
                Remove
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
