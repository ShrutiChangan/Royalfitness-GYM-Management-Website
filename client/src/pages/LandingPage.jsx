import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Dumbbell,
  Users,
  Award,
  Clock,
  Star,
  ArrowRight,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
} from "lucide-react";
import {
  trainers,
  gymServices,
  specialOffers,
} from "../data/mockData";
import BMICalculator from "../components/BMICalculator";
import UserDetailsModal from "../components/UserDetailsModal";
import PaymentModal from "../components/PaymentModal";

export default function LandingPage() {
  const { 
    reviews, 
    gallery, 
    subscriptionPlans ,
    trainers
  } = useAuth(); // Get subscriptionPlans from context instead of static import
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [userDetails, setUserDetails] = useState(null);

 const handlePlanSelect = (plan) => {
  setSelectedPlan(plan);
  setShowUserDetailsModal(true);
};

  const handleUserDetailsSubmit = (details) => {
    setUserDetails(details);
    setShowUserDetailsModal(false);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    // Redirect to login or show success message
    alert("Registration successful! You can now login with your credentials.");
  };

  const approvedReviews = reviews.filter((review) => review.approved);

  // Group plans by duration for display
  const plansByDuration = {
    month: subscriptionPlans.filter(plan => plan.duration === "month"),
    quarter: subscriptionPlans.filter(plan => plan.duration === "quarter"),
    year: subscriptionPlans.filter(plan => plan.duration === "year"),
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white py-12 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Transform Your
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              {" "}
              Body
            </span>
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-8 leading-relaxed">
            Join RoyalFitness and discover a world-class fitness experience
            with professional trainers, state-of-the-art equipment, and
            personalized workout plans designed for your success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link
              to="/login"
              className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center space-x-2 text-base md:text-lg"
            >
              <span>Start Your Journey</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="#plans"
              className="border-2 border-white text-white px-6 md:px-8 py-3 md:py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-900 transition-colors text-base md:text-lg text-center"
            >
              View Plans
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="relative z-10">
            <img
              src="https://media.istockphoto.com/id/1277242852/photo/holding-weight-and-sitting.jpg?s=612x612&w=0&k=20&c=3sy-VVhUYjABpNEMI2aoruXQuOVb__-AUR6BzOHoSJg="
              alt="Fitness Training"
              className="rounded-2xl shadow-2xl w-full h-64 md:h-96 object-cover"
            />
          </div>
          <div className="absolute -bottom-6 -right-6 w-full h-full bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl -z-10"></div>
        </div>
      </div>
    </div>
  </section>
  {/* Stats Section */}
  <section className="py-12 md:py-16 bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="text-center">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-blue-600" />
          </div>
          <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            100+
          </div>
          <div className="text-sm md:text-base text-gray-600">
            Happy Members
          </div>
        </div>
        <div className="text-center">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="h-8 w-8 text-green-600" />
          </div>
          <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            3+
          </div>
          <div className="text-sm md:text-base text-gray-600">
            Expert Trainers
          </div>
        </div>
        <div className="text-center">
          <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="h-8 w-8 text-purple-600" />
          </div>
          <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            24/7
          </div>
          <div className="text-sm md:text-base text-gray-600">
            Gym Access
          </div>
        </div>
        <div className="text-center">
          <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="h-8 w-8 text-orange-600" />
          </div>
                    <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            4.9
          </div>
          <div className="text-sm md:text-base text-gray-600">
            Average Rating
          </div>
        </div>
      </div>
    </div>
  </section>
  {/* Services Section */}
  <section id="services" className="py-12 md:py-20 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
          Our Premium Services
        </h2>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          Experience the best fitness facilities and services designed to
          help you achieve your goals
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {gymServices.map((service, index) => {
          const IconComponent =
            {
              Dumbbell,
              Users,
              Award,
              Clock,
              Star,
              ArrowRight,
            }[service.icon] || Dumbbell;

          return (
            <div
              key={index}
              className="group bg-white border border-gray-200 rounded-xl p-6 md:p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                <IconComponent className="h-8 w-8 text-blue-600 group-hover:text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">
                {service.title}
              </h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                {service.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  </section>
  {/* BMI Calculator */}
  <BMICalculator />
  {/* Subscription Plans */}
  <section id="plans" className="py-12 md:py-20 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
          Choose Your Plan
        </h2>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          Flexible membership options designed to fit your lifestyle and
          budget
        </p>
      </div>

      {/* Special Offers */}
      {specialOffers.length > 0 && (
        <div className="mb-12">
          <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6">
            {specialOffers
              .filter((offer) => offer.active)
              .map((offer) => (
                <div
                  key={offer.id}
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-xl"
                >
                  <div className="flex items-center space-x-3">
                    <Star className="h-6 w-6" />
                    <div>
                      <h3 className="font-bold text-base md:text-lg">
                        {offer.title}
                      </h3>
                      <p className="text-sm md:text-base text-orange-100">
                        {offer.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Display plans by duration */}
      {Object.entries(plansByDuration).map(([duration, plans]) => (
        plans.length > 0 && (
          <div key={duration} className="mb-16">
            <h3 className="text-2xl font-bold text-gray-800 mb-8 text-center capitalize">
              {duration}ly Plans
            </h3>
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {plans.map((plan) => (
                <div
                  key={plan._id}
                  className={`relative bg-white border-2 rounded-2xl p-6 md:p-8 transition-all duration-300 hover:shadow-2xl ${
                    plan.popular
                      ? "border-blue-500 shadow-xl scale-105"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-500 text-white px-4 md:px-6 py-2 rounded-full text-xs md:text-sm font-semibold">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </h3>
                    <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                      ₹{plan.price}
                      <span className="text-base md:text-lg text-gray-600 font-normal">
                        /{plan.duration}
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm md:text-base text-gray-700">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handlePlanSelect(plan)}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors text-center block ${
                      plan.popular
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                    }`}
                  >
                    Get Started
                  </button>
                </div>
              ))}
            </div>
          </div>
        )
      ))}
    </div>
  </section>
  {/* Gallery Section */}
  <section id="gallery" className="py-12 md:py-20 bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
          Our Gym Facilities
        </h2>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          Explore our state-of-the-art equipment and world-class facilities
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {gallery && gallery.length > 0 ? (
          gallery.map((image, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-xl"
            >
              <img
                src={image}
                alt={`Gym equipment ${index + 1}`}
                className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-sm font-medium">
                    Premium Equipment #{index + 1}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">No gallery images available</p>
          </div>
        )}
      </div>

      
    </div>
  </section>
  {/* Trainers Section */}
 <section id="trainers" className="py-12 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Expert Trainers
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Work with certified professionals who are passionate about helping
              you achieve your fitness goals
            </p>
          </div>

          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {trainers && trainers.length > 0 ? (
              trainers.map((trainer) => (
                <div
                  key={trainer.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <img
                    src={trainer.avatar || "https://static.vecteezy.com/system/resources/previews/020/765/399/original/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg"}
                    alt={trainer.name}
                    className="w-full h-48 md:h-64 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                      {trainer.name}
                    </h3>
                    <p className="text-sm md:text-base text-blue-600 font-semibold mb-2">
                      {trainer.specialization}
                    </p>
                    <p className="text-gray-600 text-sm mb-4">
                      {trainer.experience} of experience
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-semibold">
                          {trainer.rating || "4.5"}
                        </span>
                        <span className="text-sm text-gray-600">
                          rating
                        </span>
                      </div>
                      <div className="text-base md:text-lg font-bold text-gray-900">
                        ₹{trainer.fee}/session
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 mb-4">
                      Contact: {trainer.email}
                      {trainer.phone && ` | ${trainer.phone}`}
                    </div>

                    <Link
                      to="/login"
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center block text-sm md:text-base"
                    >
                      Book Session
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No Trainers Available Yet
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Our expert trainers are being onboarded. Check back soon to meet our fitness professionals!
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
  {/* Reviews Section */}
  <section className="py-12 md:py-20 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
          What Our Members Say
        </h2>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          Real stories from real people who transformed their lives at
          RoyalFitness
        </p>
      </div>

      <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {approvedReviews.map((review) => (
          <div key={review.id} className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <img
                src={review.memberAvatar}
                alt={review.memberName}
                className="w-12 h-12 rounded-full mr-4"
              />
              <div>
                <h4 className="font-semibold text-gray-900">
                  {review.memberName}
                </h4>
                <div className="flex items-center">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-sm md:text-base text-gray-700 italic">
              "{review.comment}"
            </p>
            <p className="text-sm text-gray-500 mt-4">{review.date}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
  {/* Contact Section */}
  <section id="contact" className="py-12 md:py-20 bg-blue-900 text-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-2xl md:text-4xl font-bold mb-4">
          Get In Touch
        </h2>
        <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto">
          Ready to start your fitness journey? Contact us today and let's
          make it happen!
        </p>
      </div>

      <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="bg-blue-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="h-8 w-8 text-blue-300" />
          </div>
          <h3 className="text-lg md:text-xl font-semibold mb-2">Phone</h3>
          <p className="text-sm md:text-base text-blue-100">
            +91 1234567890
          </p>
        </div>

        <div className="text-center">
          <div className="bg-blue-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="h-8 w-8 text-blue-300" />
          </div>
          <h3 className="text-lg md:text-xl font-semibold mb-2">Email</h3>
          <p className="text-sm md:text-base text-blue-100">
            info@royalfitness.com
          </p>
        </div>

        <div className="text-center">
          <div className="bg-blue-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="h-8 w-8 text-blue-300" />
          </div>
          <h3 className="text-lg md:text-xl font-semibold mb-2">
            Location
          </h3>
          <p className="text-sm md:text-base text-blue-100">
            123 Fitness Street, Health City, HC 12345
          </p>
        </div>
      </div>

      <div className="text-center mt-12">
        <Link
          to="/login"
          className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-lg font-semibold hover:opacity-90 transition-opacity inline-flex items-center space-x-2 text-base md:text-lg"
        >
          <span>Join RoyalFitness Today</span>
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </div>
  </section>
  {/* Footer */}
  <footer className="bg-gray-900 text-gray-300 py-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center space-x-2 mb-6">
            <Dumbbell className="h-8 w-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">
              RoyalFitness
            </span>
          </div>
          <p className="text-gray-400 mb-6">
            Transform your body and mind with our world-class fitness
            facilities and expert trainers.
          </p>
          <div className="flex space-x-4">
            <a
              href="#"
              className="text-gray-400 hover:text-blue-400 transition-colors"
            >
              <Facebook className="h-6 w-6" />
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-blue-400 transition-colors"
            >
              <Twitter className="h-6 w-6" />
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-blue-400 transition-colors"
            >
              <Instagram className="h-6 w-6" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-6">Quick Links</h4>
          <ul className="space-y-3">
            <li>
              <a
                href="#services"
                className="hover:text-blue-400 transition-colors"
              >
                Services
              </a>
            </li>
            <li>
              <a
                href="#plans"
                className="hover:text-blue-400 transition-colors"
              >
                Membership Plans
              </a>
            </li>
            <li>
              <a
                href="#trainers"
                className="hover:text-blue-400 transition-colors"
              >
                Trainers
              </a>
            </li>
            <li>
              <Link
                to="/login"
                className="hover:text-blue-400 transition-colors"
              >
                Member Portal
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-6">Services</h4>
          <ul className="space-y-3">
            <li>
              <span className="text-gray-400">Personal Training</span>
            </li>
            <li>
              <span className="text-gray-400">Group Classes</span>
            </li>
            <li>
              <span className="text-gray-400">Nutrition Counseling</span>
            </li>
            <li>
              <span className="text-gray-400">Spa & Wellness</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-6">Contact Info</h4>
          <ul className="space-y-3">
            <li className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-blue-400" />
              <span className="text-gray-400">+91 (555) 123-4567</span>
            </li>
            <li className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-blue-400" />
              <span className="text-gray-400">info@royalfitness.com</span>
            </li>
            <li className="flex items-start space-x-2">
              <MapPin className="h-4 w-4 text-blue-400 mt-1" />
              <span className="text-gray-400">
                123 Fitness Street
                <br />
                Health City, HC 12345
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 pt-8 mt-8 text-center">
        <p className="text-gray-400">
          © 2024 RoyalFitness. All rights reserved. Built with ❤️ for
          fitness enthusiasts.
        </p>
      </div>
    </div>
  </footer>
  {/* User Details Modal */}
 {showUserDetailsModal && (
  <UserDetailsModal
    selectedPlan={selectedPlan}
    onClose={() => setShowUserDetailsModal(false)}
    onSubmit={handleUserDetailsSubmit}
  />
)}
  {/* Payment Modal */}
  {showPaymentModal && userDetails && selectedPlan && (
  <PaymentModal
    userDetails={userDetails}
    selectedPlan={selectedPlan}
    onClose={() => setShowPaymentModal(false)}
    onSuccess={handlePaymentSuccess}
  />
)}

</div>
);
}