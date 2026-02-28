import React from "react";
import { CheckCircle, XCircle } from "lucide-react";

const Calendar = ({ 
  attendanceData, 
  goals, 
  selectedDate, 
  onDateSelect,
  viewMode = "month",
  onViewModeChange 
}) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  // Generate days array
  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  // Month names
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Check if a date has goal completion
  const getGoalStatusForDate = (date) => {
    const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][
      new Date(dateString).getDay()
    ];

    let hasGoal = false;
    let allCompleted = true;
    let anyMissed = false;

    goals.forEach(goal => {
      if (goal.dailyGoals && goal.dailyGoals[dayOfWeek] && goal.dailyGoals[dayOfWeek].title) {
        hasGoal = true;
        if (goal.missedDates && goal.missedDates.includes(dateString)) {
          anyMissed = true;
          allCompleted = false;
        } else if (!goal.completedDates || !goal.completedDates.includes(dateString)) {
          allCompleted = false;
        }
      }
    });

    if (!hasGoal) return null;
    if (anyMissed) return "missed";
    if (allCompleted) return "completed";
    return "pending";
  };

  // Get attendance status for a date
  const getAttendanceStatus = (date) => {
    const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    return attendanceData[dateString]?.member || null;
  };

  const isDateSelected = (day) => {
    if (!selectedDate || !day) return false;
    const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return selectedDate === dateString;
  };

  const handleDateClick = (day) => {
    if (!day) return;
    const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onDateSelect(dateString);
  };

  // Get day classes based on status
  const getDayClasses = (day, attendanceStatus, goalStatus, isToday, selected) => {
    const baseClasses = "relative h-10 border rounded-lg flex items-center justify-center text-sm font-medium cursor-pointer transition-all";
    
    let statusClasses = "";
    if (attendanceStatus === 'present') {
      statusClasses = 'bg-green-100 text-green-800 border-green-300';
    } else if (attendanceStatus === 'absent') {
      statusClasses = 'bg-red-100 text-red-800 border-red-300';
    } else {
      statusClasses = 'bg-gray-50 text-gray-600 border-gray-200';
    }

    const todayClass = isToday ? 'border-2 border-blue-500' : '';
    const selectedClass = selected ? 'ring-2 ring-blue-500 ring-offset-2 z-10' : '';

    return `${baseClasses} ${statusClasses} ${todayClass} ${selectedClass} hover:shadow-md hover:scale-105`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          {monthNames[currentMonth]} {currentYear}
        </h2>
        {onViewModeChange && (
          <div className="flex justify-center space-x-2 mt-2">
            <button
              onClick={() => onViewModeChange("month")}
              className={`px-3 py-1 text-sm rounded ${
                viewMode === "month" 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Month
            </button>
            <button
              onClick={() => onViewModeChange("week")}
              className={`px-3 py-1 text-sm rounded ${
                viewMode === "week" 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Week
            </button>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-1">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="h-10"></div>;
          }

          const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday = currentDate.getDate() === day && 
                         currentDate.getMonth() === currentMonth && 
                         currentDate.getFullYear() === currentYear;
          const attendanceStatus = getAttendanceStatus(day);
          const goalStatus = getGoalStatusForDate(day);
          const selected = isDateSelected(day);

          return (
            <div
              key={day}
              onClick={() => handleDateClick(day)}
              className={getDayClasses(day, attendanceStatus, goalStatus, isToday, selected)}
              title={`${dateString} - ${attendanceStatus || 'Not marked'}`}
            >
              {day}
              
              {/* Goal Status Indicators */}
              {goalStatus && (
                <div className="absolute -top-1 -right-1">
                  {goalStatus === "completed" && (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  )}
                  {goalStatus === "missed" && (
                    <XCircle className="h-3 w-3 text-red-500" />
                  )}
                  {goalStatus === "pending" && (
                    <div className="h-3 w-3 rounded-full bg-yellow-400 border border-yellow-500"></div>
                  )}
                </div>
              )}

              {/* Attendance Status Dot */}
              {attendanceStatus && !goalStatus && (
                <div className="absolute bottom-1 right-1">
                  <div className={`h-2 w-2 rounded-full ${
                    attendanceStatus === 'present' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded mr-1"></div>
          <span>Present</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded mr-1"></div>
          <span>Absent</span>
        </div>
        <div className="flex items-center">
          <CheckCircle className="h-3 w-3 text-green-600 mr-1" />
          <span>Goal Done</span>
        </div>
        <div className="flex items-center">
          <XCircle className="h-3 w-3 text-red-600 mr-1" />
          <span>Goal Missed</span>
        </div>
      </div>
    </div>
  );
};

export default Calendar;