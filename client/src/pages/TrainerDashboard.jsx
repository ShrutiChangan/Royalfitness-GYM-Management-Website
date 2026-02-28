import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Users, Calendar as CalendarIcon, Clock, Award } from 'lucide-react';
import Calendar from '../components/Calendar';

export default function TrainerDashboard() {
  const { user, scheduledSessions } = useAuth();
  const [activeTab, setActiveTab] = useState('members');

  // Filter sessions for current trainer
  const trainerSessions = scheduledSessions.filter(session => 
    session.trainerName === user?.name || session.trainerId === user?.id
  );

  // Mock data
  const assignedMembers = [
    {
      id: '1',
      name: 'John Doe',
      avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150',
      plan: 'Premium',
      joinDate: '2024-01-15',
      lastSession: '2024-01-28'
    },
    {
      id: '2',
      name: 'Alice Johnson',
      avatar: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=150',
      plan: 'Elite',
      joinDate: '2024-01-10',
      lastSession: '2024-01-29'
    },
    {
      id: '3',
      name: 'Mike Wilson',
      avatar: 'https://images.pexels.com/photos/1680172/pexels-photo-1680172.jpeg?auto=compress&cs=tinysrgb&w=150',
      plan: 'Premium',
      joinDate: '2024-01-20',
      lastSession: '2024-01-27'
    }
  ];

  const attendanceData = {
    '2024-01-15': 'present',
    '2024-01-16': 'present',
    '2024-01-17': 'absent',
    '2024-01-18': 'present',
    '2024-01-19': 'present',
    '2024-01-22': 'present',
    '2024-01-23': 'present',
    '2024-01-24': 'present',
    '2024-01-25': 'absent',
    '2024-01-26': 'present'
  };

  const sessionHistory = [
    {
      id: '1',
      title: 'Strength Training',
      memberName: 'John Doe',
      date: '2024-01-28',
      time: '10:00 AM',
      duration: '60 minutes',
      status: 'completed'
    },
    {
      id: '2',
      title: 'HIIT Session',
      memberName: 'Alice Johnson',
      date: '2024-01-29',
      time: '3:00 PM',
      duration: '45 minutes',
      status: 'completed'
    },
    {
      id: '3',
      title: 'Personal Training',
      memberName: 'Mike Wilson',
      date: '2024-01-27',
      time: '2:00 PM',
      duration: '60 minutes',
      status: 'completed'
    }
  ];

  const upcomingSessions = [
    {
      id: '4',
      title: 'Morning Workout',
      memberName: 'John Doe',
      date: '2024-01-30',
      time: '8:00 AM',
      duration: '60 minutes',
      status: 'scheduled'
    },
    {
      id: '5',
      title: 'Cardio Session',
      memberName: 'Alice Johnson',
      date: '2024-01-31',
      time: '5:00 PM',
      duration: '45 minutes',
      status: 'scheduled'
    },
    {
      id: '6',
      title: 'Flexibility Training',
      memberName: 'Mike Wilson',
      date: '2024-02-01',
      time: '11:00 AM',
      duration: '45 minutes',
      status: 'scheduled'
    }
  ];

  const tabs = [
    { id: 'members', label: 'Assigned Members', icon: Users },
    { id: 'attendance', label: 'My Attendance', icon: CalendarIcon },
    { id: 'history', label: 'Session History', icon: Award },
    { id: 'schedule', label: 'Upcoming Sessions', icon: Clock }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Trainer Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user?.name}! Manage your clients and sessions.</p>
        </div>

        {/* Trainer Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Assigned Members</p>
                <p className="text-2xl font-semibold text-gray-900">{assignedMembers.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <Award className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sessions Completed</p>
                <p className="text-2xl font-semibold text-gray-900">{sessionHistory.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming Sessions</p>
                <p className="text-2xl font-semibold text-gray-900">{upcomingSessions.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <CalendarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {Math.round((Object.values(attendanceData).filter(status => status === 'present').length / Object.values(attendanceData).length) * 100)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Vertical Tabs Layout */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Tabs */}
          <div className="flex md:flex-col space-x-4 md:space-x-0 md:space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'bg-green-100 text-green-700'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  } flex items-center space-x-2 py-2 px-4 rounded-lg shadow-sm transition-colors`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="flex-1">
            {activeTab === 'members' && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900">Assigned Members</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Member
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Plan
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Join Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Session
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {assignedMembers.map((member) => (
                        <tr key={member.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img
                                className="h-10 w-10 rounded-full"
                                src={member.avatar}
                                alt={member.name}
                              />
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{member.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {member.plan}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(member.joinDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(member.lastSession).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-green-600 hover:text-green-900 mr-3">View Profile</button>
                            <button className="text-blue-600 hover:text-blue-900">Schedule Session</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'attendance' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">My Attendance</h2>
                <div className="flex justify-center mb-6 max-w-md mx-auto">
                  <Calendar attendanceData={attendanceData} />
                </div>
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {Object.values(attendanceData).filter(status => status === 'present').length}
                    </div>
                    <div className="text-sm text-green-700">Days Present</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {Object.values(attendanceData).filter(status => status === 'absent').length}
                    </div>
                    <div className="text-sm text-red-700">Days Absent</div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round((Object.values(attendanceData).filter(status => status === 'present').length / Object.values(attendanceData).length) * 100)}%
                    </div>
                    <div className="text-sm text-blue-700">Attendance Rate</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {sessionHistory.length}
                    </div>
                    <div className="text-sm text-purple-700">Total Sessions</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900">Session History</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Session
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Member
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Duration
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sessionHistory.map((session) => (
                        <tr key={session.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {session.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {session.memberName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {session.time}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {session.duration}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {session.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'schedule' && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900">Upcoming Sessions</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {trainerSessions.length > 0 ? (
                      trainerSessions.map((session) => (
                        <div key={session.id} className="border border-gray-200 rounded-lg p-6">
                          <h3 className="text-lg font-semibold text-gray-900">{session.title} with {session.trainerName}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                            <span>{new Date(session.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {session.time}</span>
                            <span>Duration: {session.duration} minutes</span>
                            <span>Max: {session.maxParticipants} participants</span>
                            <span>Enrolled: {session.enrolledCount}</span>
                          </div>
                          <div className="flex space-x-2 mt-4">
                            <button className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm hover:bg-blue-200">
                              View Details
                            </button>
                            <button className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm hover:bg-green-200">
                              Mark Complete
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <CalendarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">No scheduled sessions yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}