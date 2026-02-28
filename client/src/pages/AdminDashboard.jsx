import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import Calendar from "../components/Calendar";
import GalleryManagement from "../components/GalleryManagement";
import {
  Settings,
  Star,
  Camera,
  Calendar as CalendarIcon,
  Users,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Save,
  Eye,
  EyeOff,
  Download,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Mail,
  Phone,
  Crown,
  TrendingUp,
  FileText,
  DollarSign,
  Target,
  Activity,
  Shield,
  Bell,
  CreditCard,
  PieChart as PieChartIcon,
  UserPlus,
  CalendarDays,
  ChartBar,
  Table,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

const AdminDashboard = () => {
  const {
    user,
    members,
    reviews,
    scheduledSessions,
    gallery,
    subscriptionPlans,
    attendanceData,
    markAttendance,
    bulkMarkAttendance,
    getAttendanceForDate,
    getAttendanceReport,
    getMemberAttendanceStats,
    updateMember,
    approveReview,
    rejectReview,
    addScheduledSession,
    addGalleryImage,
    removeGalleryImage,
    addSubscriptionPlan,
    updateSubscriptionPlan,
    deleteSubscriptionPlan,
    addTrainer,
    deleteTrainer,
    trainers,
    updateScheduledSession,
    deleteScheduledSession,
    completeScheduledSession,
  } = useAuth();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedUserType, setSelectedUserType] = useState("member");
  const [searchTerm, setSearchTerm] = useState("");
  const [reportRange, setReportRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30))
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [showTrainerForm, setShowTrainerForm] = useState(false);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [showPassword, setShowPassword] = useState({});
  const [editingSession, setEditingSession] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [sessionToCancel, setSessionToCancel] = useState(null);
  const [sessionToComplete, setSessionToComplete] = useState(null);

  // Form states
  const [trainerForm, setTrainerForm] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    experience: "",
    fee: "",
  });

  const [sessionForm, setSessionForm] = useState({
    title: "",
    trainerId: "",
    date: "",
    time: "",
    duration: "60",
    maxParticipants: "15",
  });

  const [planForm, setPlanForm] = useState({
    name: "",
    price: "",
    duration: "month",
    features: "",
    popular: false,
  });

  const [memberForm, setMemberForm] = useState({
    name: "",
    email: "",
    phone: "",
    username: "",
    password: "",
    subscriptionPlan: "",
    joinDate: "",
  });

  // Get users based on selected type
  const users = selectedUserType === "member" ? members : trainers;

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get attendance for selected date
  const currentAttendance = getAttendanceForDate(
    selectedDate,
    selectedUserType
  );

  // Updated chart data with smaller values
  const chartData = [
    { month: "Jan", members: 45, revenue: 5000, sessions: 120 },
    { month: "Feb", members: 52, revenue: 5500, sessions: 130 },
    { month: "Mar", members: 48, revenue: 5200, sessions: 125 },
    { month: "Apr", members: 60, revenue: 6000, sessions: 140 },
    { month: "May", members: 65, revenue: 6500, sessions: 150 },
    { month: "Jun", members: 70, revenue: 7000, sessions: 160 },
  ];

  const revenueData = [
    { name: "Subscriptions", value: 65, color: "#3B82F6" },
    { name: "Personal Training", value: 25, color: "#10B981" },
    { name: "Merchandise", value: 10, color: "#F59E0B" },
  ];

  const subscriptionData = [
    { name: "Basic", value: 40, color: "#3B82F6" },
    { name: "Premium", value: 45, color: "#10B981" },
    { name: "Elite", value: 15, color: "#F59E0B" },
  ];

  const classAttendance = [
    { name: "Yoga", attendance: 89, capacity: 95 },
    { name: "HIIT", attendance: 78, capacity: 85 },
    { name: "Strength", attendance: 92, capacity: 100 },
    { name: "Cardio", attendance: 85, capacity: 90 },
  ];

  // Tabs configuration - Removed Reports tab
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "attendance", label: "Attendance", icon: CalendarDays },
    { id: "members", label: "Members", icon: Users },
    { id: "trainers", label: "Trainers", icon: Activity },
    { id: "sessions", label: "Sessions", icon: CalendarIcon },
    { id: "plans", label: "Subscription Plans", icon: CreditCard },
    { id: "reviews", label: "Reviews", icon: Star },
    { id: "gallery", label: "Gallery", icon: Camera },
    { id: "finances", label: "Finances", icon: DollarSign },
  ];

  // Attendance Functions
  const handleMarkAttendance = (userId, status) => {
    markAttendance(userId, selectedDate, status, selectedUserType);
  };

  const handleBulkMark = (status) => {
    const userIds =
      selectedUsers.size > 0
        ? Array.from(selectedUsers)
        : filteredUsers.map((user) => user.id);
    bulkMarkAttendance(userIds, selectedDate, status, selectedUserType);
    setSelectedUsers(new Set());
  };

  const toggleUserSelection = (userId) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const selectAllUsers = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map((user) => user.id)));
    }
  };

  // Generate attendance report
  const attendanceReport = getAttendanceReport(
    reportRange.start,
    reportRange.end,
    selectedUserType
  );

  const calculateStats = () => {
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalRecords = 0;

    Object.values(attendanceReport).forEach((stats) => {
      totalPresent += stats.present;
      totalAbsent += stats.absent;
      totalRecords += stats.total;
    });

    return {
      totalPresent,
      totalAbsent,
      totalRecords,
      attendanceRate:
        totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0,
    };
  };

  const stats = calculateStats();

  const getTopPerformers = () => {
    return Object.entries(attendanceReport)
      .map(([userId, stats]) => {
        const user = users.find((u) => u.id === userId);
        const rate =
          stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;
        return { user, rate, present: stats.present, total: stats.total };
      })
      .filter((item) => item.user && item.total > 0)
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 5);
  };

  const topPerformers = getTopPerformers();

  // Form Handlers
  const handleAddTrainer = (e) => {
    e.preventDefault();

    // Check if all required fields are filled
    if (
      !trainerForm.name ||
      !trainerForm.email ||
      !trainerForm.specialization ||
      !trainerForm.experience ||
      !trainerForm.fee
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      // Create a complete trainer object with all necessary properties
      const newTrainer = {
        ...trainerForm,
        id: Date.now().toString(), // Generate unique ID
        avatar:
          "https://static.vecteezy.com/system/resources/previews/020/765/399/original/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg", // Default avatar
        rating: "4.5", // Default rating
        joinDate: new Date().toISOString().split("T")[0], // Current date
      };

      // Call the addTrainer function from context
      addTrainer(newTrainer);

      alert("Trainer added successfully!");

      // Reset the form
      setTrainerForm({
        name: "",
        email: "",
        phone: "",
        specialization: "",
        experience: "",
        fee: "",
      });
      setShowTrainerForm(false);
    } catch (error) {
      alert("Error adding trainer: " + error.message);
    }
  };
  // Add this function with the other handler functions
const handleDeleteTrainer = async (trainerId) => {
  if (window.confirm("Are you sure you want to remove this trainer?")) {
    try {
      await deleteTrainer(trainerId);
      alert("Trainer removed successfully!");
    } catch (error) {
      alert("Error removing trainer: " + error.message);
    }
  }
};

  const handleScheduleSession = (e) => {
    e.preventDefault();

    // Check if trainers array exists and has items
    if (!trainers || trainers.length === 0) {
      alert("No trainers available. Please add trainers first.");
      return;
    }

    const trainer = trainers.find((t) => t.id === sessionForm.trainerId);

    if (!trainer) {
      alert("Please select a valid trainer.");
      return;
    }

    const newSession = {
      ...sessionForm,
      trainerName: trainer.name,
      id: Date.now().toString(),
      enrolledCount: 0,
    };

    try {
      addScheduledSession(newSession);
      alert("Session scheduled successfully!");
      setSessionForm({
        title: "",
        trainerId: "",
        date: "",
        time: "",
        duration: "60",
        maxParticipants: "15",
      });
      setShowSessionForm(false);
    } catch (error) {
      alert("Error scheduling session: " + error.message);
    }
  };

// In your AdminDashboard component, update the plan handlers:

const handleAddPlan = async (e) => {
  e.preventDefault();
  
  try {
    console.log('Starting handleAddPlan...');
    console.log('Editing plan:', editingPlan);
    
    const featuresArray = planForm.features
      .split('\n')
      .filter(f => f.trim() !== '');
    
    const planData = {
      name: planForm.name,
      price: parseFloat(planForm.price),
      duration: planForm.duration,
      features: featuresArray,
      popular: planForm.popular,
    };

    console.log('Plan data to send:', planData);

    if (editingPlan) {
      console.log('Updating plan with ID:', editingPlan._id);
      await updateSubscriptionPlan(editingPlan._id, planData);
    } else {
      console.log('Adding new plan');
      await addSubscriptionPlan(planData);
    }

    // Reset form
    setPlanForm({
      name: "",
      price: "",
      duration: "month",
      features: "",
      popular: false,
    });
    setEditingPlan(null);
    setShowPlanForm(false);
    
    alert(`Plan ${editingPlan ? 'updated' : 'added'} successfully!`);
  } catch (error) {
    console.error('Error in handleAddPlan:', error);
    alert(`Error ${editingPlan ? 'updating' : 'adding'} plan: ${error.message}`);
  }
};

const handleDeletePlan = async (planId) => {
  if (window.confirm("Are you sure you want to delete this plan?")) {
    try {
      await deleteSubscriptionPlan(planId);
      alert("Plan deleted successfully!");
    } catch (error) {
      alert("Error deleting plan: " + error.message);
    }
  }
};

const handleEditPlan = (plan) => {
  setEditingPlan(plan);
  setPlanForm({
    name: plan.name,
    price: plan.price.toString(),
    duration: plan.duration,
    features: plan.features.join('\n'),
    popular: plan.popular || false,
  });
  setShowPlanForm(true);
};

  const handleEditMember = (member) => {
    setEditingMember(member);
    setMemberForm({
      name: member.name,
      email: member.email,
      phone: member.phone,
      username: member.username,
      password: member.password,
      subscriptionPlan: member.subscriptionPlan,
      joinDate: member.joinDate,
    });
  };

  const handleUpdateMember = (e) => {
    e.preventDefault();
    if (editingMember) {
      updateMember(editingMember.id, memberForm);
      setEditingMember(null);
      setMemberForm({
        name: "",
        email: "",
        phone: "",
        username: "",
        password: "",
        subscriptionPlan: "",
        joinDate: "",
      });
      alert("Member updated successfully!");
    }
  };
  const handleEditSession = (session) => {
    console.log("Editing session:", session);
    setEditingSession(session);
    setSessionForm({
      title: session.title,
      trainerId: session.trainerId,
      date: session.date,
      time: session.time,
      duration: session.duration,
      maxParticipants: session.maxParticipants,
    });
    setShowSessionForm(true);
  };

  const handleUpdateSession = async (e) => {
    e.preventDefault();

    if (!editingSession) return;

    const trainer = trainers.find((t) => t.id === sessionForm.trainerId);
    if (!trainer) {
      alert("Please select a valid trainer.");
      return;
    }

    const updatedSession = {
      ...editingSession,
      ...sessionForm,
      trainerName: trainer.name,
    };

    try {
      await updateScheduledSession(updatedSession);
      alert("Session updated successfully!");
      setEditingSession(null);
      setSessionForm({
        title: "",
        trainerId: "",
        date: "",
        time: "",
        duration: "60",
        maxParticipants: "15",
      });
      setShowSessionForm(false);
    } catch (error) {
      alert("Error updating session: " + error.message);
    }
  };

  const handleCancelSession = (session) => {
    console.log("Canceling session:", session);
    setSessionToCancel(session);
    setShowCancelConfirm(true);
  };

  const confirmCancelSession = async () => {
    if (sessionToCancel) {
      try {
        // Get the correct session ID (either _id or id)
        const sessionId = sessionToCancel._id || sessionToCancel.id;
        console.log("Deleting session with ID:", sessionId);

        await deleteScheduledSession(sessionId);
        alert("Session cancelled successfully!");
      } catch (error) {
        alert("Error cancelling session: " + error.message);
      }
    }
    setShowCancelConfirm(false);
    setSessionToCancel(null);
  };
  const handleMarkComplete = async (session) => {
    try {
      console.log("Marking session as complete:", session);
      // Get the correct session ID (either _id or id)
      const sessionId = session._id || session.id;

      await completeScheduledSession(sessionId);
      alert("Session marked as complete!");
    } catch (error) {
      alert("Error marking session as complete: " + error.message);
    }
    setSessionToComplete(null);
  };

  // Update the session form submission to handle both add and edit
  // Update the session form submission to handle both add and edit
  const handleSessionSubmit = async (e) => {
    e.preventDefault();

    if (!trainers || trainers.length === 0) {
      alert("No trainers available. Please add trainers first.");
      return;
    }

    const trainer = trainers.find((t) => t.id === sessionForm.trainerId);
    if (!trainer) {
      alert("Please select a valid trainer.");
      return;
    }

    try {
      if (editingSession) {
        await handleUpdateSession(e);
      } else {
        await handleScheduleSession(e);
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  };
  const togglePasswordVisibility = (memberId) => {
    setShowPassword((prev) => ({
      ...prev,
      [memberId]: !prev[memberId],
    }));
  };

  // Export functions
  const exportToCSV = () => {
    const headers = [
      "Name",
      "Email",
      "Present",
      "Absent",
      "Total",
      "Attendance Rate",
    ];
    const csvData = Object.entries(attendanceReport).map(([userId, stats]) => {
      const user = users.find((u) => u.id === userId);
      const rate =
        stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;
      return [
        user?.name || "Unknown",
        user?.email || "",
        stats.present,
        stats.absent,
        stats.total,
        `${rate}%`,
      ];
    });

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-report-${reportRange.start}-to-${reportRange.end}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Calculate financial metrics - add safe checking for members
  const financialMetrics = {
    monthlyRevenue: 7450,
    monthlyGrowth: 8.5,
    activeSubscriptions: members?.length || 0, // Safe access with optional chaining
    averageRevenuePerMember: 62.5,
    pendingPayments: 1250,
    totalRevenue: 89450,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.name}! Manage your gym operations efficiently.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Members
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {members?.length || 0}
                </p>
                <p className="text-xs text-green-600">↑ 8% this month</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Monthly Revenue
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  ₹{financialMetrics.monthlyRevenue.toLocaleString()}
                </p>
                <p className="text-xs text-green-600">
                  ↑ {financialMetrics.monthlyGrowth}% growth
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100">
                <Activity className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Active Trainers
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {trainers?.length || 0}
                </p>
                <p className="text-xs text-gray-600">3 sessions today</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <CalendarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Pending Reviews
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {reviews.filter((r) => !r.approved).length}
                </p>
                <p className="text-xs text-gray-600">2 new today</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content with Tabs */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Tabs */}
          <nav className="flex lg:flex-col w-full lg:w-64 bg-white rounded-xl shadow-lg p-4 border-b lg:border-b-0 lg:border-r border-gray-200 overflow-x-auto lg:h-fit">
            <div className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2 w-full">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      isActive
                        ? "bg-blue-50 text-blue-600 border-blue-200"
                        : "text-gray-600 border-transparent hover:bg-gray-50"
                    } flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-sm transition-all border-2 text-left min-w-max lg:min-w-full`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Content Area */}
          <div className="flex-1">
            {/* Dashboard Tab - Updated with smaller values and removed reports */}
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                {/* Revenue and Membership Growth */}
                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                      Membership Growth
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="members"
                          stroke="#3B82F6"
                          fill="#3B82F6"
                          fillOpacity={0.1}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                      Revenue Trend
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => `₹${value}`} />
                        <Bar dataKey="revenue" fill="#10B981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Simplified Second Row - Removed Reports */}
                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                      Class Attendance
                    </h3>
                    <div className="space-y-4">
                      {classAttendance.map((classItem, index) => (
                        <div key={index}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">
                              {classItem.name}
                            </span>
                            <span className="text-sm text-gray-600">
                              {classItem.attendance}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${classItem.attendance}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                      Recent Activity
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-2 bg-blue-50 rounded-lg">
                        <UserPlus className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium">
                            New member registered
                          </p>
                          <p className="text-xs text-gray-600">2 minutes ago</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-2 bg-green-50 rounded-lg">
                        <CreditCard className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium">
                            Subscription renewed
                          </p>
                          <p className="text-xs text-gray-600">
                            15 minutes ago
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-2 bg-orange-50 rounded-lg">
                        <Star className="h-5 w-5 text-orange-600" />
                        <div>
                          <p className="text-sm font-medium">
                            New review submitted
                          </p>
                          <p className="text-xs text-gray-600">1 hour ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Other tabs remain the same... */}
            {/* Attendance Tab */}
            {activeTab === "attendance" && (
              <div className="space-y-6">
                {/* Controls Section */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Calendar */}
                    <div className="flex-1">
                      <Calendar
                        attendanceData={attendanceData}
                        goals={[]}
                        selectedDate={selectedDate}
                        onDateSelect={setSelectedDate}
                      />
                    </div>

                    {/* Controls */}
                    <div className="flex-1 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Selected Date
                        </label>
                        <div className="text-lg font-semibold text-gray-900">
                          {new Date(selectedDate).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          User Type
                        </label>
                        <div className="flex space-x-4">
                          <button
                            onClick={() => {
                              setSelectedUserType("member");
                              setSelectedUsers(new Set());
                            }}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                              selectedUserType === "member"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                          >
                            Members
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUserType("trainer");
                              setSelectedUsers(new Set());
                            }}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                              selectedUserType === "trainer"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                          >
                            Trainers
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bulk Actions
                        </label>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleBulkMark("present")}
                            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Mark {selectedUsers.size > 0 ? "Selected" : "All"}{" "}
                            Present
                          </button>
                          <button
                            onClick={() => handleBulkMark("absent")}
                            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Mark {selectedUsers.size > 0 ? "Selected" : "All"}{" "}
                            Absent
                          </button>
                        </div>
                      </div>

                      {/* Search */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Search Users
                        </label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      {/* Selection Info */}
                      {selectedUsers.size > 0 && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm text-blue-700">
                            {selectedUsers.size} user
                            {selectedUsers.size !== 1 ? "s" : ""} selected
                          </p>
                          <button
                            onClick={() => setSelectedUsers(new Set())}
                            className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                          >
                            Clear selection
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Attendance List */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedUserType === "member" ? "Members" : "Trainers"}{" "}
                      Attendance
                    </h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={selectAllUsers}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {selectedUsers.size === filteredUsers.length
                          ? "Deselect All"
                          : "Select All"}
                      </button>
                      <span className="text-sm text-gray-500">
                        {filteredUsers.length} user
                        {filteredUsers.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 w-8">
                            <input
                              type="checkbox"
                              checked={
                                selectedUsers.size === filteredUsers.length &&
                                filteredUsers.length > 0
                              }
                              onChange={selectAllUsers}
                              className="rounded border-gray-300"
                            />
                          </th>
                          <th className="text-left py-3 px-4">User</th>
                          <th className="text-left py-3 px-4">Contact</th>
                          <th className="text-left py-3 px-4">Plan</th>
                          <th className="text-left py-3 px-4">Status</th>
                          <th className="text-left py-3 px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((user) => (
                          <tr
                            key={user.id}
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >
                            <td className="py-3 px-4">
                              <input
                                type="checkbox"
                                checked={selectedUsers.has(user.id)}
                                onChange={() => toggleUserSelection(user.id)}
                                className="rounded border-gray-300"
                              />
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-3">
                                <img
                                  src={user.avatar}
                                  alt={user.name}
                                  className="w-10 h-10 rounded-full"
                                />
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {user.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    Joined{" "}
                                    {new Date(
                                      user.joinDate
                                    ).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="space-y-1">
                                <div className="flex items-center text-sm text-gray-600">
                                  <Mail className="h-3 w-3 mr-2" />
                                  {user.email}
                                </div>
                                {user.phone && (
                                  <div className="flex items-center text-sm text-gray-600">
                                    <Phone className="h-3 w-3 mr-2" />
                                    {user.phone}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              {user.subscriptionPlan ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  <Crown className="h-3 w-3 mr-1" />
                                  {user.subscriptionPlan}
                                </span>
                              ) : (
                                <span className="text-xs text-gray-500">
                                  N/A
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  currentAttendance[user.id] === "present"
                                    ? "bg-green-100 text-green-800"
                                    : currentAttendance[user.id] === "absent"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {currentAttendance[user.id] === "present" && (
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                )}
                                {currentAttendance[user.id] === "absent" && (
                                  <XCircle className="h-3 w-3 mr-1" />
                                )}
                                {currentAttendance[user.id] || "Not Marked"}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() =>
                                    handleMarkAttendance(user.id, "present")
                                  }
                                  className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm hover:bg-green-200 transition-colors"
                                >
                                  Present
                                </button>
                                <button
                                  onClick={() =>
                                    handleMarkAttendance(user.id, "absent")
                                  }
                                  className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200 transition-colors"
                                >
                                  Absent
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {filteredUsers.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No users found matching your search criteria.
                      </div>
                    )}
                  </div>
                </div>

                {/* Reports Section */}
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Statistics Card */}
                  <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Report Statistics
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date Range
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="date"
                            value={reportRange.start}
                            onChange={(e) =>
                              setReportRange((prev) => ({
                                ...prev,
                                start: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                          <input
                            type="date"
                            value={reportRange.end}
                            onChange={(e) =>
                              setReportRange((prev) => ({
                                ...prev,
                                end: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-3 rounded-lg text-center">
                          <div className="text-xl font-bold text-blue-600">
                            {stats.totalRecords}
                          </div>
                          <div className="text-xs text-blue-700">
                            Total Records
                          </div>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg text-center">
                          <div className="text-xl font-bold text-green-600">
                            {stats.totalPresent}
                          </div>
                          <div className="text-xs text-green-700">Present</div>
                        </div>
                        <div className="bg-red-50 p-3 rounded-lg text-center">
                          <div className="text-xl font-bold text-red-600">
                            {stats.totalAbsent}
                          </div>
                          <div className="text-xs text-red-700">Absent</div>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg text-center">
                          <div className="text-xl font-bold text-purple-600">
                            {stats.attendanceRate}%
                          </div>
                          <div className="text-xs text-purple-700">Rate</div>
                        </div>
                      </div>

                      <button
                        onClick={exportToCSV}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Download className="h-4 w-4" />
                        <span>Export CSV Report</span>
                      </button>
                    </div>
                  </div>

                  {/* Top Performers */}
                  <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Top Performers
                    </h3>

                    <div className="space-y-3">
                      {topPerformers.map((item, index) => (
                        <div
                          key={item.user.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                              <span className="text-sm font-bold text-blue-600">
                                {index + 1}
                              </span>
                            </div>
                            <img
                              src={item.user.avatar}
                              alt={item.user.name}
                              className="w-10 h-10 rounded-full"
                            />
                            <div>
                              <div className="font-medium text-gray-900">
                                {item.user.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {item.present}/{item.total} sessions
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span className="font-semibold text-green-600">
                              {item.rate}%
                            </span>
                          </div>
                        </div>
                      ))}

                      {topPerformers.length === 0 && (
                        <div className="text-center py-4 text-gray-500">
                          No attendance data available for the selected period.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Members Tab */}
            {activeTab === "members" && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">
                      Members Management
                    </h3>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                      <UserPlus className="h-5 w-5" />
                      <span>Add Member</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Member
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Username
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Password
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Plan
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Join Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {members?.map((member) => (
                          <tr key={member.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <img
                                  className="h-10 w-10 rounded-full"
                                  src={
                                    member.avatar ||
                                    "https://static.vecteezy.com/system/resources/previews/020/765/399/original/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg"
                                  }
                                  alt=""
                                />
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {member.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {member.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {member.username}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center">
                                <span className="mr-2">
                                  {showPassword[member.id]
                                    ? member.password
                                    : "••••••••"}
                                </span>
                                <button
                                  onClick={() =>
                                    togglePasswordVisibility(member.id)
                                  }
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  {showPassword[member.id] ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                {member.subscriptionPlan}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {member.joinDate}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleEditMember(member)}
                                className="text-blue-600 hover:text-blue-900 mr-3"
                              >
                                Edit
                              </button>
                              <button className="text-red-600 hover:text-red-900">
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Edit Member Form */}
                  {editingMember && (
                    <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Edit Member
                      </h4>
                      <form
                        onSubmit={handleUpdateMember}
                        className="grid md:grid-cols-2 gap-4"
                      >
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name
                          </label>
                          <input
                            type="text"
                            value={memberForm.name}
                            onChange={(e) =>
                              setMemberForm({
                                ...memberForm,
                                name: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            value={memberForm.email}
                            onChange={(e) =>
                              setMemberForm({
                                ...memberForm,
                                email: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone
                          </label>
                          <input
                            type="text"
                            value={memberForm.phone}
                            onChange={(e) =>
                              setMemberForm({
                                ...memberForm,
                                phone: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Username
                          </label>
                          <input
                            type="text"
                            value={memberForm.username}
                            onChange={(e) =>
                              setMemberForm({
                                ...memberForm,
                                username: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                          </label>
                          <input
                            type="text"
                            value={memberForm.password}
                            onChange={(e) =>
                              setMemberForm({
                                ...memberForm,
                                password: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Plan
                          </label>
                          <select
                            value={memberForm.subscriptionPlan}
                            onChange={(e) =>
                              setMemberForm({
                                ...memberForm,
                                subscriptionPlan: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          >
                            <option value="Basic">Basic</option>
                            <option value="Premium">Premium</option>
                            <option value="Elite">Elite</option>
                          </select>
                        </div>
                        <div className="md:col-span-2 flex space-x-4">
                          <button
                            type="button"
                            onClick={() => setEditingMember(null)}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md"
                          >
                            Update
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* Trainers Tab */}
            {/* Trainers Tab */}
            {/* Trainers Tab */}
{activeTab === "trainers" && (
  <div className="space-y-6">
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900">
          Trainers Management
        </h3>
        <button
          onClick={() => setShowTrainerForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          Add Trainer
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trainers && trainers.length > 0 ? (
          trainers.map((trainer) => (
            <div
              key={trainer.id}
              className="border border-gray-200 rounded-lg p-6"
            >
              <img
                src={
                  trainer.avatar ||
                  "https://static.vecteezy.com/system/resources/previews/020/765/399/original/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg"
                }
                alt={trainer.name}
                className="w-16 h-16 rounded-full mx-auto mb-4"
              />
              <h4 className="text-lg font-semibold text-center mb-2">
                {trainer.name}
              </h4>
              <p className="text-blue-600 text-center mb-2">
                {trainer.specialization}
              </p>
              <p className="text-sm text-gray-600 text-center mb-4">
                {trainer.experience} experience
              </p>
              <div className="text-center mb-4">
                <span className="text-yellow-500 font-bold">
                  {trainer.rating || "4.5"}
                </span>
                <span className="text-gray-600 text-sm">
                  {" "}
                  rating
                </span>
              </div>
              <div className="text-center mb-4">
                <span className="text-green-600 font-bold">
                  ₹{trainer.fee}
                </span>
                <span className="text-gray-600 text-sm">
                  {" "}
                  per session
                </span>
              </div>
              <div className="flex justify-center space-x-2">
                {/* REMOVE the Edit button and keep only Remove button */}
                <button 
                  onClick={() => handleDeleteTrainer(trainer.id)}
                  className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-8">
            <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No trainers added yet</p>
            <p className="text-sm text-gray-500 mt-2">
              Click "Add Trainer" to create your first trainer profile
            </p>
          </div>
        )}
      </div>
    </div>
  </div>
)}
            {/* Sessions Tab */}
            {/* Sessions Tab */}
            {activeTab === "sessions" && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Live Sessions Management
                  </h2>
                  <button
                    onClick={() => {
                      if (!trainers || trainers.length === 0) {
                        alert(
                          "Please add trainers first before scheduling sessions."
                        );
                        return;
                      }
                      setEditingSession(null);
                      setSessionForm({
                        title: "",
                        trainerId: "",
                        date: "",
                        time: "",
                        duration: "60",
                        maxParticipants: "15",
                      });
                      setShowSessionForm(true);
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Schedule Session</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {scheduledSessions && scheduledSessions.length > 0 ? (
                    scheduledSessions.map((session) => {
                      const sessionId = session._id || session.id;
                      console.log("Session data:", session); // Debug log

                      return (
                        <div
                          key={sessionId}
                          className="border border-gray-200 rounded-lg p-6"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {session.title} with {session.trainerName}
                              </h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                                <span>
                                  {new Date(session.date).toLocaleDateString(
                                    "en-US",
                                    {
                                      weekday: "long",
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    }
                                  )}{" "}
                                  at {session.time}
                                </span>
                                <span>
                                  Duration: {session.duration} minutes
                                </span>
                                <span>
                                  Max: {session.maxParticipants} participants
                                </span>
                                <span>
                                  Enrolled: {session.enrolledCount || 0}
                                </span>
                              </div>
                              {session.completed && (
                                <div className="mt-2">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Completed
                                  </span>
                                </div>
                              )}
                              {session.cancelled && (
                                <div className="mt-2">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Cancelled
                                  </span>
                                </div>
                              )}
                            </div>
                            {!session.completed && !session.cancelled && (
                              <div className="flex space-x-2 ml-4">
                                <button
                                  onClick={() => handleEditSession(session)}
                                  className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm hover:bg-blue-200 transition-colors flex items-center space-x-1"
                                >
                                  <Edit className="h-4 w-4" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  onClick={() => handleCancelSession(session)}
                                  className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-sm hover:bg-red-200 transition-colors flex items-center space-x-1"
                                >
                                  <X className="h-4 w-4" />
                                  <span>Cancel</span>
                                </button>
                                <button
                                  onClick={() => handleMarkComplete(session)}
                                  className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm hover:bg-green-200 transition-colors flex items-center space-x-1"
                                >
                                  <Check className="h-4 w-4" />
                                  <span>Complete</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <CalendarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">No scheduled sessions yet</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Click "Schedule Session" to create your first session
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* Subscription Plans Tab */}
            {activeTab === "plans" && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Subscription Plans Management
                  </h2>
                  <button
                    onClick={() => setShowPlanForm(true)}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Add Plan</span>
                  </button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {subscriptionPlans?.map((plan) => (
                    <div
                      key={plan._id}
                      className={`border-2 rounded-xl p-6 ${
                        plan.popular
                          ? "border-purple-500 relative"
                          : "border-gray-200"
                      }`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                            Most Popular
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-gray-900">
                          {plan.name}
                        </h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditPlan(plan)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePlan(plan._id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-purple-600 mb-4">
                        ₹{plan.price}
                        <span className="text-lg text-gray-600">
                          /{plan.duration}
                        </span>
                      </div>
                      <ul className="space-y-2 mb-6">
                        {plan.features.map((feature, index) => (
                          <li
                            key={index}
                            className="flex items-center text-sm text-gray-700"
                          >
                            <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors">
                        Select Plan
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Reviews Tab */}
            
            {activeTab === "reviews" && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Reviews Management
                </h2>
                <div className="space-y-4">
                  {reviews?.map((review) => {
                    // Use _id for MongoDB or id for local
                    const reviewId = review._id || review.id;
                    console.log("Review ID:", reviewId, "Review:", review);

                    return (
                      <div
                        key={reviewId}
                        className={`border rounded-lg p-6 ${
                          review.approved
                            ? "border-green-200 bg-green-50"
                            : "border-yellow-200 bg-yellow-50"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-start space-x-4">
                            <img
                              src={review.memberAvatar}
                              alt={review.memberName}
                              className="w-12 h-12 rounded-full"
                            />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h4 className="font-semibold text-gray-900">
                                  {review.memberName}
                                </h4>
                                <div className="flex">
                                  {[...Array(review.rating)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className="h-4 w-4 text-yellow-400 fill-current"
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-gray-500">
                                  {review.date}
                                </span>
                              </div>
                              <p className="text-gray-700">{review.comment}</p>
                            </div>
                          </div>
                          {!review.approved && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  console.log(
                                    "Approving review with ID:",
                                    reviewId
                                  );
                                  approveReview(reviewId);
                                }}
                                className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  console.log(
                                    "Rejecting review with ID:",
                                    reviewId
                                  );
                                  rejectReview(reviewId);
                                }}
                                className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                          {review.approved && (
                            <button
                              onClick={() => {
                                console.log(
                                  "Deleting approved review with ID:",
                                  reviewId
                                );
                                rejectReview(reviewId);
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {/* Gallery Tab */}
            {activeTab === "gallery" && <GalleryManagement />}
            {/* Finances Tab */}
            {activeTab === "finances" && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Total Revenue
                        </p>
                        <p className="text-2xl font-semibold text-gray-900">
                          ₹{financialMetrics.totalRevenue.toLocaleString()}
                        </p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-500" />
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center text-sm text-green-600">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        <span>8.5% increase</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Active Subscriptions
                        </p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {financialMetrics.activeSubscriptions}
                        </p>
                      </div>
                      <CreditCard className="h-8 w-8 text-blue-500" />
                    </div>
                    <div className="mt-4">
                      <div className="text-sm text-gray-600">
                        ₹{financialMetrics.averageRevenuePerMember} avg/month
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Pending Payments
                        </p>
                        <p className="text-2xl font-semibold text-gray-900">
                          ₹{financialMetrics.pendingPayments}
                        </p>
                      </div>
                      <Clock className="h-8 w-8 text-orange-500" />
                    </div>
                    <div className="mt-4">
                      <div className="text-sm text-gray-600">
                        8 overdue invoices
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Monthly Target
                        </p>
                        <p className="text-2xl font-semibold text-gray-900">
                          78%
                        </p>
                      </div>
                      <Target className="h-8 w-8 text-purple-500" />
                    </div>
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: "78%" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                      Revenue Breakdown
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={revenueData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {revenueData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                      Subscription Distribution
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={subscriptionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {subscriptionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {/* Add Trainer Modal */}
      {showTrainerForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  Add New Trainer
                </h2>
                <button
                  onClick={() => setShowTrainerForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <form onSubmit={handleAddTrainer} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={trainerForm.name}
                      onChange={(e) =>
                        setTrainerForm({ ...trainerForm, name: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter trainer's full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={trainerForm.email}
                      onChange={(e) =>
                        setTrainerForm({
                          ...trainerForm,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      value={trainerForm.phone}
                      onChange={(e) =>
                        setTrainerForm({
                          ...trainerForm,
                          phone: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter mobile number"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Specialization *
                    </label>
                    <select
                      value={trainerForm.specialization}
                      onChange={(e) =>
                        setTrainerForm({
                          ...trainerForm,
                          specialization: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Specialization</option>
                      <option value="Strength Training">
                        Strength Training
                      </option>
                      <option value="Cardio & HIIT">Cardio & HIIT</option>
                      <option value="Yoga & Flexibility">
                        Yoga & Flexibility
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Experience *
                    </label>
                    <input
                      type="text"
                      value={trainerForm.experience}
                      onChange={(e) =>
                        setTrainerForm({
                          ...trainerForm,
                          experience: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., 5 years"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Fee (₹) *
                    </label>
                    <input
                      type="number"
                      value={trainerForm.fee}
                      onChange={(e) =>
                        setTrainerForm({ ...trainerForm, fee: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter fee per session"
                      min="1"
                      required
                    />
                  </div>
                </div>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowTrainerForm(false)}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2"
                  >
                    <Save className="h-5 w-5" />
                    <span>Add Trainer</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Session Modal */}
      {showSessionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  Schedule Live Session
                </h2>
                <button
                  onClick={() => setShowSessionForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <form onSubmit={handleScheduleSession} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Title *
                    </label>
                    <input
                      type="text"
                      value={sessionForm.title}
                      onChange={(e) =>
                        setSessionForm({
                          ...sessionForm,
                          title: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., HIIT Class, Yoga Session"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trainer *
                    </label>
                    <select
                      value={sessionForm.trainerId}
                      onChange={(e) =>
                        setSessionForm({
                          ...sessionForm,
                          trainerId: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Trainer</option>
                      {trainers.map((trainer) => (
                        <option key={trainer.id} value={trainer.id}>
                          {trainer.name} - {trainer.specialization}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={sessionForm.date}
                      onChange={(e) =>
                        setSessionForm({ ...sessionForm, date: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      min={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time *
                    </label>
                    <input
                      type="time"
                      value={sessionForm.time}
                      onChange={(e) =>
                        setSessionForm({ ...sessionForm, time: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (minutes) *
                    </label>
                    <select
                      value={sessionForm.duration}
                      onChange={(e) =>
                        setSessionForm({
                          ...sessionForm,
                          duration: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    >
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">60 minutes</option>
                      <option value="90">90 minutes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Participants *
                    </label>
                    <input
                      type="number"
                      value={sessionForm.maxParticipants}
                      onChange={(e) =>
                        setSessionForm({
                          ...sessionForm,
                          maxParticipants: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      min="1"
                      max="50"
                      required
                    />
                  </div>
                </div>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowSessionForm(false)}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2"
                  >
                    <CalendarIcon className="h-5 w-5" />
                    <span>Schedule Session</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Add/Edit Plan Modal */}
      {showPlanForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingPlan ? "Edit Plan" : "Add New Plan"}
                </h2>
                <button
                  onClick={() => {
                    setShowPlanForm(false);
                    setEditingPlan(null);
                    setPlanForm({
                      name: "",
                      price: "",
                      duration: "month",
                      features: "",
                      popular: false,
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <form onSubmit={handleAddPlan} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Plan Name *
                    </label>
                    <input
                      type="text"
                      value={planForm.name}
                      onChange={(e) =>
                        setPlanForm({ ...planForm, name: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., Basic, Premium, Elite"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      value={planForm.price}
                      onChange={(e) =>
                        setPlanForm({ ...planForm, price: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., 29, 79, 129"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration *
                    </label>
                    <select
                      value={planForm.duration}
                      onChange={(e) =>
                        setPlanForm({ ...planForm, duration: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    >
                      <option value="month">Monthly</option>
                      <option value="quarter">Quarterly</option>
                      <option value="year">Yearly</option>
                    </select>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="popular"
                      checked={planForm.popular}
                      onChange={(e) =>
                        setPlanForm({ ...planForm, popular: e.target.checked })
                      }
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="popular"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Mark as Popular
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Features (one per line) *
                  </label>
                  <textarea
                    value={planForm.features}
                    onChange={(e) =>
                      setPlanForm({ ...planForm, features: e.target.value })
                    }
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter each feature on a new line"
                    required
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPlanForm(false);
                      setEditingPlan(null);
                      setPlanForm({
                        name: "",
                        price: "",
                        duration: "month",
                        features: "",
                        popular: false,
                      });
                    }}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center space-x-2"
                  >
                    <Save className="h-5 w-5" />
                    <span>{editingPlan ? "Update Plan" : "Add Plan"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Session Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Cancel Session
              </h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to cancel the session "
                {sessionToCancel?.title}" with {sessionToCancel?.trainerName}?
              </p>
              <p className="text-sm text-gray-600 mb-6">
                This action cannot be undone. Participants will be notified
                about the cancellation.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Keep Session
                </button>
                <button
                  onClick={confirmCancelSession}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Cancel Session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
