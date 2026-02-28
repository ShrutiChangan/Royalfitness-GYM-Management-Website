import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import Calendar from "../components/Calendar";
import {
  Calendar as CalendarIcon,
  Target,
  User,
  Star,
  CheckCircle,
  XCircle,
  TrendingUp,
  Award,
  Clock,
  BarChart3,
  Dumbbell,
  Heart,
  Settings,
  Bell,
  CreditCard,
  FileText,
  Activity,
  Users as UsersIcon,
  Target as TargetIcon,
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  Zap,
  Trophy,
  ActivityIcon
} from "lucide-react";

const MemberDashboard = () => {
  const { user, getMemberAttendanceStats, attendanceData, scheduledSessions, addReview } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [goals, setGoals] = useState([]);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
   // Add these state declarations RIGHT HERE:
  const [sessions, setSessions] = useState(
    scheduledSessions.map(session => ({
      ...session,
      scheduled: false // Add scheduled status to each session
    }))
  );

  // Goal form state
  const [goalForm, setGoalForm] = useState({
    title: "",
    type: "fitness",
    target: "",
    unit: "sessions",
    deadline: ""
  });

  // Review form state
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: ""
  });

  // Initialize goals from localStorage
  useEffect(() => {
    const savedGoals = localStorage.getItem("memberGoals");
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }
  }, []);

  // Save goals to localStorage
  useEffect(() => {
    localStorage.setItem("memberGoals", JSON.stringify(goals));
  }, [goals]);

  // Get member attendance stats
  const attendanceStats = getMemberAttendanceStats(user?.id);

  // Calculate streak
  const calculateStreak = () => {
    const dates = Object.keys(attendanceData).sort().reverse();
    let streak = 0;
    
    for (const date of dates) {
      if (attendanceData[date]?.member?.[user?.id] === 'present') {
        streak++;
      } else if (attendanceData[date]?.member?.[user?.id] === 'absent') {
        break;
      }
    }
    
    return streak;
  };

  const currentStreak = calculateStreak();

  // Calculate monthly progress
  const getMonthlyProgress = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    let presentThisMonth = 0;
    let totalDaysThisMonth = 0;

    Object.entries(attendanceData).forEach(([date, data]) => {
      const recordDate = new Date(date);
      if (recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear) {
        totalDaysThisMonth++;
        if (data.member?.[user?.id] === 'present') {
          presentThisMonth++;
        }
      }
    });

    return {
      present: presentThisMonth,
      total: totalDaysThisMonth,
      rate: totalDaysThisMonth > 0 ? Math.round((presentThisMonth / totalDaysThisMonth) * 100) : 0
    };
  };

  const monthlyProgress = getMonthlyProgress();

  // Get weekly summary
  const getWeeklySummary = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    let presentThisWeek = 0;
    let totalThisWeek = 0;

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      
      if (date <= today) {
        totalThisWeek++;
        if (attendanceData[dateString]?.member?.[user?.id] === 'present') {
          presentThisWeek++;
        }
      }
    }

    return { present: presentThisWeek, total: totalThisWeek };
  };

  const weeklySummary = getWeeklySummary();

  // Sample goals data
  const sampleGoals = [
    {
      id: 1,
      title: "Weekly Workout",
      type: "fitness",
      target: 5,
      completed: 3,
      unit: "sessions",
      progress: 0,
      deadline: "2024-02-28"
    },
    {
      id: 2,
      title: "Weight Loss",
      type: "health",
      target: 5,
      completed: 2,
      unit: "kg",
      progress: 40,
      deadline: "2024-03-15"
    },
    {
      id: 3,
      title: "Running Distance",
      type: "cardio",
      target: 20,
      completed: 15,
      unit: "km",
      progress: 75,
      deadline: "2024-02-25"
    }
  ];

  // Upcoming sessions - use the sessions state instead of scheduledSessions
const upcomingSessions = sessions.filter(session => 
  new Date(session.date) >= new Date()
).slice(0, 3);

  // Tabs configuration
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "attendance", label: "Attendance", icon: CalendarIcon },
    { id: "goals", label: "Goals", icon: Target },
    { id: "sessions", label: "Sessions", icon: Activity },
    { id: "progress", label: "Progress", icon: TrendingUp },
    { id: "profile", label: "Profile", icon: User }
  ];

  // Goal management functions
  const handleAddGoal = (e) => {
    e.preventDefault();
    if (editingGoal) {
      setGoals(goals.map(goal => 
        goal.id === editingGoal.id 
          ? { ...goalForm, id: editingGoal.id, progress: 0, completed: 0 }
          : goal
      ));
      setEditingGoal(null);
    } else {
      const newGoal = {
        ...goalForm,
        id: Date.now(),
        progress: 0,
        completed: 0
      };
      setGoals([...goals, newGoal]);
    }
    setGoalForm({
      title: "",
      type: "fitness",
      target: "",
      unit: "sessions",
      deadline: ""
    });
    setShowGoalForm(false);
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setGoalForm({
      title: goal.title,
      type: goal.type,
      target: goal.target,
      unit: goal.unit,
      deadline: goal.deadline
    });
    setShowGoalForm(true);
  };

  const handleDeleteGoal = (id) => {
    setGoals(goals.filter(goal => goal.id !== id));
  };

  const handleAddReview = (e) => {
    e.preventDefault();
    addReview({
      memberName: user?.name,
      memberAvatar: user?.avatar,
      ...reviewForm,
      date: new Date().toISOString().split('T')[0],
    });
    setReviewForm({ rating: 5, comment: "" });
    setShowReviewForm(false);
    alert("Thank you for your review! It will be published after approval.");
  };

  // Add these session handler functions RIGHT HERE:
  const handleScheduleSession = (sessionId) => {
    setSessions(prev => 
      prev.map(session => 
        session.id === sessionId 
          ? { ...session, scheduled: true }
          : session
      )
    );
  };

  const handleDeclineSession = (sessionId) => {
    setSessions(prev => 
      prev.filter(session => session.id !== sessionId)
    );
  };

  // Calculate goal statistics
  const goalStatistics = {
    total: goals.length,
    completed: goals.filter(g => g.progress >= 100).length,
    inProgress: goals.filter(g => g.progress > 0 && g.progress < 100).length,
    notStarted: goals.filter(g => g.progress === 0).length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600 mt-2">Track your fitness journey and achieve your goals</p>
        </div>

        {/* Member Info Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src={user?.avatar}
                alt={user?.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{user?.name}</h2>
                <p className="text-blue-600">{user?.subscriptionPlan} Plan</p>
                <p className="text-gray-600">Member since: {user?.joinDate}</p>
                {user?.trainer && (
                  <p className="text-gray-600">Trainer: {user?.trainer}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 text-green-600">
                <Award className="h-5 w-5" />
                <span className="font-semibold">Active Member</span>
              </div>
              <p className="text-sm text-gray-500">Good standing</p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="flex justify-center mb-2">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-green-600">{attendanceStats.presentCount}</div>
            <div className="text-sm text-gray-600">Days Present</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="flex justify-center mb-2">
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-blue-600">{attendanceStats.attendanceRate}%</div>
            <div className="text-sm text-gray-600">Attendance Rate</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="flex justify-center mb-2">
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-purple-600">{currentStreak}</div>
            <div className="text-sm text-gray-600">Current Streak</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="flex justify-center mb-2">
              <Target className="h-8 w-8 text-orange-500" />
            </div>
            <div className="text-2xl font-bold text-orange-600">{goalStatistics.total}</div>
            <div className="text-sm text-gray-600">Active Goals</div>
          </div>
        </div>

        {/* Main Content with Tabs */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Navigation Tabs */}
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
            {/* Dashboard Tab */}
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Attendance Overview */}
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Overview</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">This Week</span>
                          <span className="text-sm font-semibold">
                            {weeklySummary.present}/{weeklySummary.total} days
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${weeklySummary.total > 0 ? (weeklySummary.present / weeklySummary.total) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">This Month</span>
                          <span className="text-sm font-semibold">
                            {monthlyProgress.present}/{monthlyProgress.total} days
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${monthlyProgress.rate}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Overall</span>
                          <span className="text-sm font-semibold">{attendanceStats.attendanceRate}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full"
                            style={{ width: `${attendanceStats.attendanceRate}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Current Streak */}
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Streak</h3>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-purple-600 mb-2">{currentStreak}</div>
                      <p className="text-gray-600">consecutive days</p>
                      {currentStreak > 0 ? (
                        <div className="mt-4 p-3 bg-green-50 rounded-lg">
                          <p className="text-sm text-green-700">
                            🎉 Amazing! Keep up the great work!
                          </p>
                        </div>
                      ) : (
                        <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                          <p className="text-sm text-yellow-700">
                            Start your streak today! Every day counts.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">Goals Progress</h4>
                      <Target className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold text-green-600">{goalStatistics.completed}/{goalStatistics.total}</div>
                    <p className="text-sm text-gray-600">Goals completed</p>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">Upcoming Sessions</h4>
                      <CalendarIcon className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold text-blue-600">{upcomingSessions.length}</div>
                    <p className="text-sm text-gray-600">Scheduled</p>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">Workouts This Week</h4>
                      <ActivityIcon className="h-5 w-5 text-orange-500" />
                    </div>
                    <div className="text-2xl font-bold text-orange-600">{weeklySummary.present}</div>
                    <p className="text-sm text-gray-600">Sessions completed</p>
                  </div>
                </div>

                {/* Upcoming Sessions */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Upcoming Sessions</h3>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      View All
                    </button>
                  </div>
                  <div className="space-y-3">
                    {upcomingSessions.length > 0 ? (
                      upcomingSessions.map((session) => (
                        <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-10 bg-blue-500 rounded-full"></div>
                            <div>
                              <h4 className="font-medium text-gray-900">{session.title}</h4>
                              <p className="text-sm text-gray-600">
                                with {session.trainerName} • {new Date(session.date).toLocaleDateString()} at {session.time}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No upcoming sessions scheduled</p>
                        <p className="text-sm text-gray-400 mt-1">Book a session with your trainer</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-3 gap-6">
                  <button 
                    onClick={() => setActiveTab("sessions")}
                    className="bg-white rounded-xl shadow-lg p-6 text-left hover:shadow-xl transition-shadow"
                  >
                    <div className="flex items-center space-x-3">
                      <CalendarIcon className="h-8 w-8 text-blue-500" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Book Session</h4>
                        <p className="text-sm text-gray-600">Schedule with your trainer</p>
                      </div>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => setShowGoalForm(true)}
                    className="bg-white rounded-xl shadow-lg p-6 text-left hover:shadow-xl transition-shadow"
                  >
                    <div className="flex items-center space-x-3">
                      <Target className="h-8 w-8 text-green-500" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Set Goals</h4>
                        <p className="text-sm text-gray-600">Track your progress</p>
                      </div>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => setShowReviewForm(true)}
                    className="bg-white rounded-xl shadow-lg p-6 text-left hover:shadow-xl transition-shadow"
                  >
                    <div className="flex items-center space-x-3">
                      <Star className="h-8 w-8 text-yellow-500" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Write Review</h4>
                        <p className="text-sm text-gray-600">Share your experience</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Attendance Tab */}
            {activeTab === "attendance" && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Attendance Tracker</h2>
                  
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Calendar */}
                    <div>
                      <Calendar 
                        attendanceData={attendanceData} 
                        goals={goals}
                        selectedDate={selectedDate}
                        onDateSelect={setSelectedDate}
                      />
                    </div>

                    {/* Attendance Details */}
                    <div className="space-y-6">
                      {/* Selected Date Info */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          {new Date(selectedDate).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </h3>
                        
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Your Status</span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            attendanceData[selectedDate]?.member?.[user?.id] === 'present'
                              ? 'bg-green-100 text-green-800'
                              : attendanceData[selectedDate]?.member?.[user?.id] === 'absent'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {attendanceData[selectedDate]?.member?.[user?.id] === 'present' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {attendanceData[selectedDate]?.member?.[user?.id] === 'absent' && <XCircle className="h-3 w-3 mr-1" />}
                            {attendanceData[selectedDate]?.member?.[user?.id] || 'Not Recorded'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {attendanceData[selectedDate]?.member?.[user?.id] === 'present' 
                            ? 'Great job! You attended the gym on this day.'
                            : attendanceData[selectedDate]?.member?.[user?.id] === 'absent'
                            ? 'You were marked absent on this day.'
                            : 'No attendance record for this date.'
                          }
                        </p>
                      </div>

                      {/* Weekly Summary */}
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">This Week</h4>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-blue-700">
                            {weeklySummary.present} of {weeklySummary.total} days
                          </span>
                          <span className="text-sm font-semibold text-blue-900">
                            {weeklySummary.total > 0 ? Math.round((weeklySummary.present / weeklySummary.total) * 100) : 0}%
                          </span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${weeklySummary.total > 0 ? (weeklySummary.present / weeklySummary.total) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Monthly Progress */}
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-semibold text-green-900 mb-2">Monthly Progress</h4>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-green-700">
                            {monthlyProgress.present} of {monthlyProgress.total} days
                          </span>
                          <span className="text-sm font-semibold text-green-900">
                            {monthlyProgress.rate}%
                          </span>
                        </div>
                        <div className="w-full bg-green-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${monthlyProgress.rate}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Streak Info */}
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h4 className="font-semibold text-purple-900 mb-2">Current Streak</h4>
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="h-5 w-5 text-purple-600" />
                          <span className="text-2xl font-bold text-purple-600">{currentStreak} days</span>
                        </div>
                        <p className="text-sm text-purple-700 mt-1">
                          {currentStreak > 0 
                            ? `Keep going! You're on a ${currentStreak}-day streak.`
                            : 'Start building your streak today!'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Attendance Statistics */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                    <div className="text-3xl font-bold text-green-600">{attendanceStats.presentCount}</div>
                    <div className="text-sm text-gray-600">Total Present Days</div>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                    <div className="text-3xl font-bold text-blue-600">{attendanceStats.attendanceRate}%</div>
                    <div className="text-sm text-gray-600">Overall Attendance</div>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                    <div className="text-3xl font-bold text-purple-600">{currentStreak}</div>
                    <div className="text-sm text-gray-600">Longest Streak</div>
                  </div>
                </div>
              </div>
            )}

            {/* Goals Tab */}
            {activeTab === "goals" && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Your Fitness Goals</h2>
                    <button 
                      onClick={() => {
                        setEditingGoal(null);
                        setGoalForm({
                          title: "",
                          type: "fitness",
                          target: "",
                          unit: "sessions",
                          deadline: ""
                        });
                        setShowGoalForm(true);
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <Plus className="h-5 w-5" />
                      <span>Add New Goal</span>
                    </button>
                  </div>
                  
                  {/* Goals Statistics */}
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <div className="text-xl font-bold text-blue-600">{goalStatistics.total}</div>
                      <div className="text-xs text-blue-700">Total Goals</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <div className="text-xl font-bold text-green-600">{goalStatistics.completed}</div>
                      <div className="text-xs text-green-700">Completed</div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg text-center">
                      <div className="text-xl font-bold text-yellow-600">{goalStatistics.inProgress}</div>
                      <div className="text-xs text-yellow-700">In Progress</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <div className="text-xl font-bold text-gray-600">{goalStatistics.notStarted}</div>
                      <div className="text-xs text-gray-700">Not Started</div>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sampleGoals.map(goal => (
                      <div key={goal.id} className="border border-gray-200 rounded-lg p-6 relative">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
                          <div className="flex items-center space-x-1">
                            {goal.type === 'fitness' ? (
                              <Dumbbell className="h-4 w-4 text-blue-500" />
                            ) : goal.type === 'health' ? (
                              <Heart className="h-4 w-4 text-red-500" />
                            ) : (
                              <Zap className="h-4 w-4 text-green-500" />
                            )}
                            <span className="text-xs text-gray-500 capitalize">{goal.type}</span>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{goal.completed}/{goal.target} {goal.unit}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${goal.progress}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">
                            {goal.progress}% complete
                          </span>
                          <span className="text-xs text-gray-500">
                            Due: {new Date(goal.deadline).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleEditGoal(goal)}
                            className="flex-1 bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteGoal(goal.id)}
                            className="flex-1 bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {sampleGoals.length === 0 && (
                    <div className="text-center py-12">
                      <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">You don't have any goals yet.</p>
                      <p className="text-sm text-gray-500">
                        Set your first fitness goal to start tracking your progress.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sessions Tab */}
            {/* Sessions Tab */}
{activeTab === "sessions" && (
  <div className="bg-white rounded-xl shadow-lg p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Training Sessions</h2>
    
    <div className="space-y-6">
      {/* Available Sessions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Sessions</h3>
        <div className="space-y-4">
          {upcomingSessions.filter(session => !session.scheduled).length > 0 ? (
            upcomingSessions
              .filter(session => !session.scheduled)
              .map((session) => (
                <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{session.title}</h4>
                      <p className="text-gray-600">with {session.trainerName}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(session.date).toLocaleDateString()} at {session.time} • {session.duration} minutes
                      </p>
                      <p className="text-sm text-blue-600 mt-1">
                        {session.enrolledCount}/{session.maxParticipants} participants enrolled
                      </p>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button 
                        onClick={() => handleScheduleSession(session.id)}
                        className="bg-green-100 text-green-700 p-2 rounded-lg hover:bg-green-200 transition-colors flex items-center justify-center"
                        title="Schedule Session"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => handleDeclineSession(session.id)}
                        className="bg-red-100 text-red-700 p-2 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center"
                        title="Decline Session"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Action buttons for unscheduled sessions */}
                  <div className="flex space-x-2 mt-3">
                    <button className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200 transition-colors">
                      Reschedule
                    </button>
                    <button className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200 transition-colors">
                      Cancel
                    </button>
                    <button className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              ))
          ) : (
            <div className="text-center py-8">
              <CalendarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No available sessions</p>
              <p className="text-sm text-gray-500 mt-2">
                All sessions have been scheduled or declined
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Scheduled Sessions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Scheduled Sessions</h3>
        <div className="space-y-4">
          {upcomingSessions.filter(session => session.scheduled).length > 0 ? (
            upcomingSessions
              .filter(session => session.scheduled)
              .map((session) => (
                <div key={session.id} className="border border-green-200 bg-green-50 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{session.title}</h4>
                      <p className="text-gray-600">with {session.trainerName}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(session.date).toLocaleDateString()} at {session.time} • {session.duration} minutes
                      </p>
                      <p className="text-sm text-blue-600 mt-1">
                        {session.enrolledCount}/{session.maxParticipants} participants enrolled
                      </p>
                    </div>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                      <CheckCircle className="h-4 w-4" />
                      <span>Scheduled</span>
                    </span>
                  </div>
                  
                  {/* No action buttons for scheduled sessions - only status */}
                  <div className="mt-3 text-sm text-green-700 bg-green-100 px-3 py-2 rounded-lg">
                    ✅ Your session has been confirmed. See you there!
                  </div>
                </div>
              ))
          ) : (
            <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
              <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No scheduled sessions yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Click the checkmark (✓) on available sessions to schedule them
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Past Sessions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Sessions</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Personal Training Session</h4>
                  <p className="text-sm text-gray-600">Completed 2 days ago</p>
                  <p className="text-xs text-gray-500">with Sarah Johnson</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                  Completed
                </span>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)}

            {/* Progress Tab */}
            {activeTab === "progress" && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Progress Overview</h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-blue-900 mb-4">Attendance History</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>This Month</span>
                          <span className="font-semibold">{monthlyProgress.rate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last Month</span>
                          <span className="font-semibold">0%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Overall</span>
                          <span className="font-semibold">{attendanceStats.attendanceRate}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-green-900 mb-4">Goal Achievement</h3>
                      <div className="space-y-3">
                        {sampleGoals.map(goal => (
                          <div key={goal.id} className="flex items-center justify-between">
                            <span className="text-sm">{goal.title}</span>
                            <span className="font-semibold">{goal.progress}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Achievements */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Achievements</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <Award className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                      <p className="text-sm font-medium">5-Day Streak</p>
                      <p className="text-xs text-gray-600">Unlocked</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <TargetIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <p className="text-sm font-medium">Goal Master</p>
                      <p className="text-xs text-gray-600">3 goals completed</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <UsersIcon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                      <p className="text-sm font-medium">Regular Member</p>
                      <p className="text-xs text-gray-600">1 month active</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <TrendingUp className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                      <p className="text-sm font-medium">Progress King</p>
                      <p className="text-xs text-gray-600">75% avg progress</p>
                    </div>
                  </div>
                </div>

                {/* Progress Charts */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Progress</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Workout Consistency</span>
                        <span>{monthlyProgress.rate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-green-500 h-3 rounded-full"
                          style={{ width: `${monthlyProgress.rate}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Goal Completion</span>
                        <span>60%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-blue-500 h-3 rounded-full"
                          style={{ width: `60%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Session Attendance</span>
                        <span>85%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-purple-500 h-3 rounded-full"
                          style={{ width: `85%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Profile</h2>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="md:col-span-1">
                    <div className="text-center">
                      <img
                        src={user?.avatar}
                        alt={user?.name}
                        className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-blue-100"
                      />
                      <h3 className="text-xl font-semibold text-gray-900">{user?.name}</h3>
                      <p className="text-blue-600">{user?.subscriptionPlan} Member</p>
                      <div className="mt-2 flex items-center justify-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                        ))}
                        <span className="text-sm text-gray-600">Active Member</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                          <p className="text-gray-900">{user?.email}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                          <p className="text-gray-900">{user?.phone || "Not provided"}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Membership Since</label>
                          <p className="text-gray-900">{user?.joinDate}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Trainer</label>
                          <p className="text-gray-900">{user?.trainer || "Not assigned"}</p>
                        </div>
                      </div>
                      
                      <div className="border-t pt-4">
                        <h4 className="font-semibold text-gray-900 mb-3">Quick Stats</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-lg font-bold text-blue-600">{attendanceStats.attendanceRate}%</div>
                            <div className="text-xs text-gray-600">Attendance</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-600">{currentStreak}</div>
                            <div className="text-xs text-gray-600">Day Streak</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-purple-600">{goalStatistics.total}</div>
                            <div className="text-xs text-gray-600">Goals</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-4">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                          Edit Profile
                        </button>
                        <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors">
                          Change Password
                        </button>
                        <button 
                          onClick={() => setShowReviewForm(true)}
                          className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-lg hover:bg-yellow-200 transition-colors"
                        >
                          Write Review
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Goal Modal */}
      {showGoalForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                {editingGoal ? "Edit Goal" : "Add New Goal"}
              </h3>
            </div>
            <div className="p-6">
              <form onSubmit={handleAddGoal} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Goal Title</label>
                  <input
                    type="text"
                    value={goalForm.title}
                    onChange={(e) => setGoalForm({...goalForm, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="e.g., Lose 5kg, Run 10km"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Goal Type</label>
                  <select
                    value={goalForm.type}
                    onChange={(e) => setGoalForm({...goalForm, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="fitness">Fitness</option>
                    <option value="health">Health</option>
                    <option value="cardio">Cardio</option>
                    <option value="strength">Strength</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target</label>
                    <input
                      type="number"
                      value={goalForm.target}
                      onChange={(e) => setGoalForm({...goalForm, target: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="e.g., 5"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                    <select
                      value={goalForm.unit}
                      onChange={(e) => setGoalForm({...goalForm, unit: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="sessions">Sessions</option>
                      <option value="kg">Kilograms</option>
                      <option value="km">Kilometers</option>
                      <option value="days">Days</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                  <input
                    type="date"
                    value={goalForm.deadline}
                    onChange={(e) => setGoalForm({...goalForm, deadline: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowGoalForm(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg"
                  >
                    {editingGoal ? "Update" : "Add"} Goal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Write a Review</h3>
            </div>
            <div className="p-6">
              <form onSubmit={handleAddReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        onClick={() => setReviewForm({...reviewForm, rating: star})}
                        className={`h-8 w-8 cursor-pointer ${
                          star <= reviewForm.rating
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Share your experience with the gym..."
                    required
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberDashboard;