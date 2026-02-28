import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const API_BASE_URL = 'http://localhost:5000/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [members, setMembers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [scheduledSessions, setScheduledSessions] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch all data from backend
  // Fetch all data from backend// Fetch all data from backend
const fetchData = async () => {
  try {
    setLoading(true);
    console.log('Fetching data from backend...');
    
    // Fetch members
    const membersRes = await fetch(`${API_BASE_URL}/members`);
    const membersData = await membersRes.json();
    setMembers(membersData);
    console.log('Members fetched:', membersData.length);

    // Fetch reviews
    const reviewsRes = await fetch(`${API_BASE_URL}/reviews`);
    const reviewsData = await reviewsRes.json();
    setReviews(reviewsData);
    console.log('Reviews fetched:', reviewsData.length);

    // Fetch sessions
    const sessionsRes = await fetch(`${API_BASE_URL}/sessions`);
    const sessionsData = await sessionsRes.json();
    setScheduledSessions(sessionsData);
    console.log('Sessions fetched:', sessionsData.length);

    // ADD THIS LINE: Fetch subscription plans
    await fetchSubscriptionPlans();

  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    setLoading(false);
  }
};
  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Login function
  const login = async (username, password) => {
    try {
      console.log('Attempting login for:', username);
      
      // Check against members from backend
      const foundMember = members.find(m => 
        m.username === username && m.password === password
      );
      
      if (foundMember) {
        setUser(foundMember);
        console.log('Member login successful:', foundMember.name);
        return { success: true, user: foundMember };
      }
      
      // Check if it's an admin
      if (username === 'admin' && password === 'admin') {
        const adminUser = {
          id: 'admin',
          name: 'Admin User',
          email: 'admin@gym.com',
          role: 'admin'
        };
        setUser(adminUser);
        console.log('Admin login successful');
        return { success: true, user: adminUser };
      }
      
      console.log('Login failed: Invalid credentials');
      return { success: false, message: 'Invalid credentials' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed' };
    }
  };

  const logout = () => {
    console.log('User logged out');
    setUser(null);
  };

  // Register member
  // Register member
const registerMember = async (memberData) => {
  try {
    console.log('Registering new member:', memberData);
    
    // Add better logging to see what's being sent
    console.log('Sending request to:', `${API_BASE_URL}/members`);
    console.log('Request payload:', JSON.stringify(memberData, null, 2));
    
    const response = await fetch(`${API_BASE_URL}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(memberData),
    });
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    if (response.ok) {
      const newMember = await response.json();
      setMembers(prev => [...prev, newMember]);
      console.log('Member registered successfully:', newMember._id);
      return newMember;
    } else {
      // Try to get error details from response
      let errorMessage = 'Registration failed';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
        console.error('Backend error details:', errorData);
      } catch (parseError) {
        console.error('Could not parse error response:', parseError);
        errorMessage = `Registration failed with status: ${response.status}`;
      }
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('Registration error details:', error);
    
    // Check if it's a network error
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error('Network error - backend might be down');
      throw new Error('Cannot connect to server. Please check if backend is running.');
    }
    
    throw error;
  }
};

  // Update member
  const updateMember = async (memberId, updatedData) => {
    try {
      console.log('Updating member:', memberId, updatedData);
      const response = await fetch(`${API_BASE_URL}/members/${memberId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      
      if (response.ok) {
        const updatedMember = await response.json();
        setMembers(prev => 
          prev.map(member => member._id === memberId ? updatedMember : member)
        );
        console.log('Member updated successfully');
        return updatedMember;
      } else {
        throw new Error('Failed to update member');
      }
    } catch (error) {
      console.error('Update member error:', error);
      throw error;
    }
  };

  // Delete member
  const deleteMember = async (memberId) => {
    try {
      console.log('Deleting member:', memberId);
      const response = await fetch(`${API_BASE_URL}/members/${memberId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setMembers(prev => prev.filter(member => member._id !== memberId));
        console.log('Member deleted successfully');
        return true;
      } else {
        throw new Error('Failed to delete member');
      }
    } catch (error) {
      console.error('Delete member error:', error);
      throw error;
    }
  };

  // Add trainer
  const addTrainer = async (trainerData) => {
    try {
      console.log('Adding trainer:', trainerData);
      // For now, handle locally since we don't have trainers endpoint
      const newTrainer = {
        ...trainerData,
        id: Date.now().toString(),
        joinDate: new Date().toISOString().split('T')[0],
        rating: "4.5",
        avatar: "https://static.vecteezy.com/system/resources/previews/020/765/399/original/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg"
      };
      
      setTrainers(prev => [...prev, newTrainer]);
      console.log('Trainer added successfully');
      return newTrainer;
    } catch (error) {
      console.error('Add trainer error:', error);
      throw error;
    }
  };

  // Update trainer
  const updateTrainer = async (trainerId, updatedData) => {
    try {
      console.log('Updating trainer:', trainerId, updatedData);
      setTrainers(prev => 
        prev.map(trainer => 
          trainer.id === trainerId ? { ...trainer, ...updatedData } : trainer
        )
      );
      console.log('Trainer updated successfully');
    } catch (error) {
      console.error('Update trainer error:', error);
      throw error;
    }
  };

  // Delete trainer
  const deleteTrainer = async (trainerId) => {
    try {
      console.log('Deleting trainer:', trainerId);
      setTrainers(prev => prev.filter(trainer => trainer.id !== trainerId));
      console.log('Trainer deleted successfully');
    } catch (error) {
      console.error('Delete trainer error:', error);
      throw error;
    }
  };

  // Session management

// Session management - FIXED VERSION
const addScheduledSession = async (sessionData) => {
  try {
    console.log('Adding session:', sessionData);
    const response = await fetch(`${API_BASE_URL}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sessionData),
    });
    
    if (response.ok) {
      const newSession = await response.json();
      setScheduledSessions(prev => [...prev, newSession]);
      console.log('Session added successfully');
      return newSession;
    } else {
      const errorText = await response.text();
      console.error('Add session failed:', response.status, errorText);
      throw new Error(`Failed to add session: ${response.status}`);
    }
  } catch (error) {
    console.error('Add session error:', error);
    throw error;
  }
};

const updateScheduledSession = async (updatedSession) => {
  try {
    console.log('Updating session:', updatedSession);
    
    // Use _id for MongoDB or id for local
    const sessionId = updatedSession._id || updatedSession.id;
    if (!sessionId) {
      throw new Error('No valid session ID found');
    }
    
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedSession),
    });
    
    console.log('Update session response status:', response.status);
    
    if (response.ok) {
      const session = await response.json();
      setScheduledSessions(prev => 
        prev.map(s => {
          const sessionIdentifier = s._id || s.id;
          return sessionIdentifier === sessionId ? session : s;
        })
      );
      console.log('Session updated successfully');
      return session;
    } else {
      const errorText = await response.text();
      console.error('Update session failed:', response.status, errorText);
      throw new Error(`Failed to update session: ${response.status}`);
    }
  } catch (error) {
    console.error('Update session error:', error);
    throw error;
  }
};

const deleteScheduledSession = async (sessionId) => {
  try {
    console.log('Deleting session:', sessionId);
    
    // Validate sessionId
    if (!sessionId || sessionId === 'undefined') {
      throw new Error('Invalid session ID');
    }
    
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
      method: 'DELETE',
    });
    
    console.log('Delete session response status:', response.status);
    
    if (response.ok) {
      setScheduledSessions(prev => 
        prev.filter(session => {
          const sessionIdentifier = session._id || session.id;
          return sessionIdentifier !== sessionId;
        })
      );
      console.log('Session deleted successfully');
      return true;
    } else {
      const errorText = await response.text();
      console.error('Delete session failed:', response.status, errorText);
      throw new Error(`Failed to delete session: ${response.status}`);
    }
  } catch (error) {
    console.error('Delete session error:', error);
    throw error;
  }
};

const completeScheduledSession = async (sessionId) => {
  try {
    console.log('Completing session:', sessionId);
    
    // Find the session using both _id and id
    const session = scheduledSessions.find(s => 
      (s._id === sessionId) || (s.id === sessionId)
    );
    
    if (!session) {
      throw new Error('Session not found');
    }
    
    const updatedSession = { 
      ...session, 
      completed: true,
      status: 'completed'
    };
    
    return await updateScheduledSession(updatedSession);
  } catch (error) {
    console.error('Complete session error:', error);
    throw error;
  }
};


  // Review management
// Review management - FIXED VERSION
const addReview = async (reviewData) => {
  try {
    console.log('Adding review:', reviewData);
    const response = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reviewData),
    });
    
    if (response.ok) {
      const newReview = await response.json();
      setReviews(prev => [...prev, newReview]);
      console.log('Review added successfully:', newReview._id);
      return newReview;
    } else {
      const errorText = await response.text();
      console.error('Add review failed:', response.status, errorText);
      throw new Error(`Failed to add review: ${response.status}`);
    }
  } catch (error) {
    console.error('Add review error:', error);
    throw error;
  }
};

const approveReview = async (reviewId) => {
  try {
    console.log('Approving review:', reviewId);
    
    // Validate reviewId
    if (!reviewId || reviewId === 'undefined') {
      throw new Error('Invalid review ID');
    }
    
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/approve`, {
      method: 'PATCH',
    });
    
    console.log('Approve review response status:', response.status);
    
    if (response.ok) {
      const approvedReview = await response.json();
      setReviews(prev => 
        prev.map(review => {
          // Handle both _id (MongoDB) and id (local)
          const reviewIdentifier = review._id || review.id;
          return reviewIdentifier === reviewId ? approvedReview : review;
        })
      );
      console.log('Review approved successfully');
      return approvedReview;
    } else {
      const errorText = await response.text();
      console.error('Approve review failed:', response.status, errorText);
      throw new Error(`Failed to approve review: ${response.status}`);
    }
  } catch (error) {
    console.error('Approve review error:', error);
    throw error;
  }
};

const rejectReview = async (reviewId) => {
  try {
    console.log('Rejecting review:', reviewId);
    
    // Validate reviewId
    if (!reviewId || reviewId === 'undefined') {
      throw new Error('Invalid review ID');
    }
    
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
      method: 'DELETE',
    });
    
    console.log('Reject review response status:', response.status);
    
    if (response.ok) {
      setReviews(prev => 
        prev.filter(review => {
          // Handle both _id (MongoDB) and id (local)
          const reviewIdentifier = review._id || review.id;
          return reviewIdentifier !== reviewId;
        })
      );
      console.log('Review rejected successfully');
      return true;
    } else {
      const errorText = await response.text();
      console.error('Reject review failed:', response.status, errorText);
      throw new Error(`Failed to reject review: ${response.status}`);
    }
  } catch (error) {
    console.error('Reject review error:', error);
    throw error;
  }
};
  // Attendance Functions
  const markAttendance = (userId, date, status, userType = 'member') => {
    const key = `${userType}_${userId}_${date}`;
    setAttendanceData(prev => ({
      ...prev,
      [key]: status
    }));
    console.log(`Attendance marked: ${userId} - ${status} on ${date}`);
  };

  const bulkMarkAttendance = (userIds, date, status, userType = 'member') => {
    const newAttendanceData = { ...attendanceData };
    userIds.forEach(userId => {
      const key = `${userType}_${userId}_${date}`;
      newAttendanceData[key] = status;
    });
    setAttendanceData(newAttendanceData);
    console.log(`Bulk attendance marked: ${userIds.length} users - ${status} on ${date}`);
  };

  const getAttendanceForDate = (date, userType = 'member') => {
    const result = {};
    const users = userType === 'member' ? members : trainers;
    
    users.forEach(user => {
      const key = `${userType}_${user.id}_${date}`;
      result[user.id] = attendanceData[key] || 'not marked';
    });
    
    return result;
  };

  const getAttendanceReport = (startDate, endDate, userType = 'member') => {
    const report = {};
    const users = userType === 'member' ? members : trainers;
    
    users.forEach(user => {
      const userStats = {
        present: 0,
        absent: 0,
        total: 0
      };
      
      Object.keys(attendanceData).forEach(key => {
        if (key.startsWith(`${userType}_${user.id}_`)) {
          const status = attendanceData[key];
          if (status === 'present') userStats.present++;
          if (status === 'absent') userStats.absent++;
          userStats.total++;
        }
      });
      
      report[user.id] = userStats;
    });
    
    console.log('Attendance report generated for period:', startDate, 'to', endDate);
    return report;
  };

  const getMemberAttendanceStats = (memberId) => {
    const stats = {
      present: Math.floor(Math.random() * 20) + 10,
      absent: Math.floor(Math.random() * 5),
      total: Math.floor(Math.random() * 25) + 15
    };
    console.log('Member attendance stats:', memberId, stats);
    return stats;
  };

  // Gallery functions
  const addGalleryImage = (imageUrl) => {
    setGallery(prev => [...prev, imageUrl]);
    console.log('Gallery image added:', imageUrl);
  };

  const removeGalleryImage = (index) => {
    setGallery(prev => prev.filter((_, i) => i !== index));
    console.log('Gallery image removed at index:', index);
  };

  // Subscription plan functions
  // Subscription plan functions - UPDATED FOR BACKEND
const fetchSubscriptionPlans = async () => {
  try {
    console.log('Fetching subscription plans from backend...');
    const response = await fetch(`${API_BASE_URL}/subscription-plans`);
    
    if (response.ok) {
      const plans = await response.json();
      setSubscriptionPlans(plans);
      console.log('Subscription plans fetched successfully:', plans.length);
      return plans;
    } else {
      console.error('Failed to fetch subscription plans');
      // Fallback to empty array
      setSubscriptionPlans([]);
      return [];
    }
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    // Fallback to empty array
    setSubscriptionPlans([]);
    return [];
  }
};

const addSubscriptionPlan = async (planData) => {
  try {
    console.log('Adding subscription plan to backend:', planData);
    const response = await fetch(`${API_BASE_URL}/subscription-plans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(planData),
    });

    if (response.ok) {
      const newPlan = await response.json();
      setSubscriptionPlans(prev => [...prev, newPlan]);
      console.log('Subscription plan added successfully:', newPlan._id);
      return newPlan;
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add subscription plan');
    }
  } catch (error) {
    console.error('Error adding subscription plan:', error);
    throw error;
  }
};

const updateSubscriptionPlan = async (planId, planData) => {
  try {
    console.log('Updating subscription plan:', planId, planData);
    const response = await fetch(`${API_BASE_URL}/subscription-plans/${planId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(planData),
    });

    if (response.ok) {
      const updatedPlan = await response.json();
      setSubscriptionPlans(prev => 
        prev.map(plan => plan._id === planId ? updatedPlan : plan)
      );
      console.log('Subscription plan updated successfully');
      return updatedPlan;
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update subscription plan');
    }
  } catch (error) {
    console.error('Error updating subscription plan:', error);
    throw error;
  }
};

const deleteSubscriptionPlan = async (planId) => {
  try {
    console.log('Deleting subscription plan:', planId);
    const response = await fetch(`${API_BASE_URL}/subscription-plans/${planId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      setSubscriptionPlans(prev => prev.filter(plan => plan._id !== planId));
      console.log('Subscription plan deleted successfully');
      return true;
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete subscription plan');
    }
  } catch (error) {
    console.error('Error deleting subscription plan:', error);
    throw error;
  }
};

  // Schedule session (legacy function)
  const scheduleSession = (session) => {
    console.log('Session scheduled:', session);
  };

  // Provide all data and functions
  const value = {
    // State
    user,
    members,
    reviews,
    scheduledSessions,
    trainers,
    subscriptionPlans,
    gallery,
    attendanceData,
    loading,

    // Auth functions
    login,
    logout,
    registerMember,
    isAuthenticated: !!user,

    // Member functions
    updateMember,
    deleteMember,

    // Trainer functions
    addTrainer,
    updateTrainer,
    deleteTrainer,

    // Session functions
    scheduleSession,
    addScheduledSession,
    updateScheduledSession,
    deleteScheduledSession,
    completeScheduledSession,

    // Review functions
    addReview,
    approveReview,
    rejectReview,

    // Attendance functions
    markAttendance,
    bulkMarkAttendance,
    getAttendanceForDate,
    getAttendanceReport,
    getMemberAttendanceStats,

    // Gallery functions
    addGalleryImage,
    removeGalleryImage,

    // Subscription plan functions
    addSubscriptionPlan,
    updateSubscriptionPlan,
    deleteSubscriptionPlan,
    fetchSubscriptionPlans
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Export gym services and special offers
export const gymServices = [
  {
    icon: 'Dumbbell',
    title: 'Strength Training',
    description: 'State-of-the-art weight training equipment and free weights'
  },
  {
    icon: 'Heart',
    title: 'Cardio Equipment',
    description: 'Latest cardio machines including treadmills, bikes, and ellipticals'
  },
  {
    icon: 'Users',
    title: 'Group Classes',
    description: 'Yoga, Pilates, Zumba, Spin, and HIIT classes led by certified instructors'
  },
  {
    icon: 'Waves',
    title: 'Swimming Pool',
    description: 'Olympic-sized swimming pool for laps and aqua aerobics'
  },
  {
    icon: 'Sparkles',
    title: 'Spa & Wellness',
    description: 'Sauna, steam room, and massage therapy for recovery and relaxation'
  },
  {
    icon: 'Apple',
    title: 'Nutrition Counseling',
    description: 'Personalized meal plans and dietary guidance from certified nutritionists'
  }
];

export const specialOffers = [
  {
    id: '1',
    title: 'New Year Special',
    description: '50% off first month for new members',
    validUntil: '2024-02-29',
    discountPercent: 50,
    active: true
  },
  {
    id: '2',
    title: 'Student Discount',
    description: '25% off all plans with valid student ID',
    validUntil: '2024-12-31',
    discountPercent: 25,
    active: true
  }
];