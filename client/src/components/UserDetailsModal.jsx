import React, { useState } from "react";
import { X, CreditCard, Upload, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../contexts/AuthContext"; // Import the auth context

export default function UserDetailsModal({ selectedPlan, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    address: "",
    selectedTrainer: "",
    username: "",
    password: "",
    confirmPassword: "",
    profilePhoto: null,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  // REPLACE: Remove any static trainers declaration
  // WITH: Add this inside the component function
  const { trainers } = useAuth();

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profilePhoto") {
      setFormData({
        ...formData,
        [name]: files[0],
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.dob) newErrors.dob = "Date of birth is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Select a Trainer (Optional)
    </label>
    <select
      name="selectedTrainer"
      value={formData.selectedTrainer}
      onChange={handleInputChange}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    >
      <option value="">No trainer selected</option>
      {trainers && trainers.length > 0 ? (
        trainers.map((trainer) => (
          <option key={trainer.id} value={trainer.id}>
            {trainer.name} - {trainer.specialization} (₹{trainer.fee}/session)
          </option>
        ))
      ) : (
        <option value="" disabled>
          No trainers available
        </option>
      )}
    </select>
    {trainers && trainers.length === 0 && (
      <p className="mt-1 text-sm text-gray-500">
        No trainers currently available. You can add a trainer later.
      </p>
    )}
  </div>;

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        profilePhoto: file,
      });
    }
  };

  if (!selectedPlan) return null;
  // PASTE handleSubmit HERE
  const handleSubmit = (e) => {
  e.preventDefault();
  if (validateForm()) {
    const selectedTrainerObj = trainers.find(
      (t) => t.id === formData.selectedTrainer
    );
    onSubmit({
      ...formData,
      selectedPlanId: selectedPlan._id || selectedPlan.id,
      selectedPlanName: selectedPlan.name,
      selectedPlanPrice: selectedPlan.price,
      selectedPlanDuration: selectedPlan.duration,
      selectedTrainerName: selectedTrainerObj ? selectedTrainerObj.name : "",
      selectedTrainerId: formData.selectedTrainer,
      selectedTrainerFee: selectedTrainerObj ? selectedTrainerObj.fee : 0, // Add trainer fee
      totalAmount: selectedPlan.price + (selectedTrainerObj ? parseInt(selectedTrainerObj.fee) : 0) // Add total amount
    });
  }
};
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Complete Your Registration
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Plan Summary */}
          {/* Plan Summary */}
<div className="bg-blue-50 p-4 rounded-lg mb-6">
  <h3 className="font-semibold text-blue-900 mb-2">Selected Plan: {selectedPlan.name}</h3>
  <div className="space-y-1">
    <div className="flex justify-between">
      <span className="text-blue-700">Plan Price:</span>
      <span className="text-blue-700">₹{selectedPlan.price}/{selectedPlan.duration}</span>
    </div>
    {formData.selectedTrainer && (
      <>
        <div className="flex justify-between">
          <span className="text-blue-700">Trainer Fee:</span>
          <span className="text-blue-700">
            ₹{trainers.find(t => t.id === formData.selectedTrainer)?.fee || 0}/session
          </span>
        </div>
        <div className="border-t border-blue-200 pt-1 mt-1">
          <div className="flex justify-between font-semibold">
            <span className="text-blue-900">Total Amount:</span>
            <span className="text-blue-900">
              ₹{selectedPlan.price} + ₹{trainers.find(t => t.id === formData.selectedTrainer)?.fee || 0}/session
            </span>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            * Trainer fee is charged per session separately
          </p>
        </div>
      </>
    )}
  </div>
</div>

          {/* User Details Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Enter your phone number"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border ${
                    errors.dob ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
                {errors.dob && (
                  <p className="mt-1 text-sm text-red-600">{errors.dob}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username *
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border ${
                    errors.username ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Choose a username"
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border ${
                      errors.password ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10`}
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border ${
                      errors.confirmPassword
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select a Trainer (Optional)
                </label>
                <select
                  name="selectedTrainer"
                  value={formData.selectedTrainer}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">No trainer selected</option>
                  {trainers && trainers.length > 0 ? (
                    trainers.map((trainer) => (
                      <option key={trainer.id} value={trainer.id}>
                        {trainer.name} - {trainer.specialization} (₹
                        {trainer.fee}/session)
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      No trainers available
                    </option>
                  )}
                </select>
                {trainers && trainers.length === 0 && (
                  <p className="mt-1 text-sm text-gray-500">
                    No trainers currently available. You can add a trainer
                    later.
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Photo (Optional)
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-4 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        Click to upload
                      </p>
                    </div>
                    <input
                      type="file"
                      name="profilePhoto"
                      className="hidden"
                      onChange={handleProfilePhotoChange}
                      accept="image/*"
                    />
                  </label>
                  {formData.profilePhoto && (
                    <div className="text-sm text-gray-600">
                      <p>Selected: {formData.profilePhoto.name}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-4 py-3 border ${
                  errors.address ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="Enter your complete address"
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address}</p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">
                Terms & Conditions
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Membership fees are non-refundable</li>
                <li>
                  • 24-hour cancellation policy for personal training sessions
                </li>
                <li>• Gym access is subject to operating hours and policies</li>
                <li>• Members must follow all gym rules and regulations</li>
              </ul>
              <label className="flex items-center mt-3">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  required
                />
                <span className="ml-2 text-sm text-gray-700">
                  I agree to the terms and conditions
                </span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <CreditCard className="h-5 w-5" />
                <span>Proceed to Payment</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
