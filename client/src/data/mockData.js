export const subscriptionPlans = [
  {
    id: '1',
    name: 'Basic',
    price: 29,
    duration: 'month',
    features: [
      'Gym access during regular hours',
      'Basic equipment usage',
      'Locker room access',
      'Online workout tracking'
    ],
    popular: false
  },
  {
    id: '2',
    name: 'Premium',
    price: 59,
    duration: 'month',
    features: [
      'All Basic features',
      '24/7 gym access',
      'Group classes included',
      'Sauna and steam room',
      'Nutrition consultation',
      'Guest passes (2/month)'
    ],
    popular: true
  },
  {
    id: '3',
    name: 'Elite',
    price: 99,
    duration: 'month',
    features: [
      'All Premium features',
      'Personal training sessions',
      'Priority class booking',
      'Massage therapy',
      'Custom meal plans',
      'Unlimited guest passes'
    ],
    popular: false
  }
];

export const trainers = [
  {
    id: '1',
    name: 'Sarah Johnson',
    specialization: 'Strength Training',
    experience: '8 years',
    fee: 25,
    avatar: 'https://static.vecteezy.com/system/resources/previews/005/544/718/original/profile-icon-design-free-vector.jpg',
    bio: 'Certified personal trainer specializing in strength training and muscle building.',
    rating: 4.9,
    sessions: 1200
  },
  {
    id: '2',
    name: 'Mike Chen',
    specialization: 'Cardio & HIIT',
    experience: '6 years',
    fee: 20,
    avatar: 'https://static.vecteezy.com/system/resources/previews/005/544/718/original/profile-icon-design-free-vector.jpg',
    bio: 'High-energy trainer focused on cardiovascular health and HIIT workouts.',
    rating: 4.8,
    sessions: 950
  },
  {
    id: '3',
    name: 'Emily Davis',
    specialization: 'Yoga & Flexibility',
    experience: '10 years',
    fee: 30,
    avatar: 'https://static.vecteezy.com/system/resources/previews/005/544/718/original/profile-icon-design-free-vector.jpg',
    bio: 'Experienced yoga instructor and flexibility coach with mindfulness approach.',
    rating: 4.9,
    sessions: 1500
  }
];

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

export const equipmentGallery = [
  'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=500',
  'https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg?auto=compress&cs=tinysrgb&w=500',
  'https://images.pexels.com/photos/1552106/pexels-photo-1552106.jpeg?auto=compress&cs=tinysrgb&w=500',
  'https://images.pexels.com/photos/1552103/pexels-photo-1552103.jpeg?auto=compress&cs=tinysrgb&w=500',
  'https://images.pexels.com/photos/1229356/pexels-photo-1229356.jpeg?auto=compress&cs=tinysrgb&w=500',
  'https://images.pexels.com/photos/2247179/pexels-photo-2247179.jpeg?auto=compress&cs=tinysrgb&w=500'
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
