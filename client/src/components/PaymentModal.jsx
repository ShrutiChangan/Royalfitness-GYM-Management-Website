import React, { useState } from 'react';
import { X, CreditCard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function PaymentModal({ userDetails, selectedPlan, onClose, onSuccess }) {
  // Add safety check at the beginning
  if (!selectedPlan) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 max-w-md w-full">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-4">Plan information is missing. Please try again.</p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const { registerMember } = useAuth();
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData({
      ...paymentData,
      [name]: value
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!paymentData.cardNumber.trim() || paymentData.cardNumber.replace(/\s/g, '').length !== 16) {
      newErrors.cardNumber = 'Valid card number is required';
    }
    
    if (!paymentData.expiryDate.trim() || !/^\d{2}\/\d{2}$/.test(paymentData.expiryDate)) {
      newErrors.expiryDate = 'Valid expiry date (MM/YY) is required';
    }
    
    if (!paymentData.cvv.trim() || paymentData.cvv.length !== 3) {
      newErrors.cvv = 'Valid CVV is required';
    }
    
    if (!paymentData.cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setProcessing(true);
      
      // Simulate payment processing
      try {
        // In a real app, this would call a payment API
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulate successful payment
        const success = Math.random() > 0.1; // 90% success rate for demo
        
        if (success) {
          // Register the member
          await registerMember(userDetails);
          onSuccess();
        } else {
          alert('Payment failed. Please try again.');
        }
      } catch (error) {
        alert('An error occurred during payment processing. Please try again.');
      } finally {
        setProcessing(false);
      }
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const handleCardNumberChange = (e) => {
    const formattedValue = formatCardNumber(e.target.value);
    setPaymentData({
      ...paymentData,
      cardNumber: formattedValue
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Payment Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Order Summary</h3>
            <div className="flex justify-between mb-1">
              <span className="text-gray-600">Plan:</span>
              <span className="font-medium">{selectedPlan?.name || 'N/A'}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-gray-600">Duration:</span>
              <span className="font-medium">{selectedPlan?.duration || 'N/A'}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-gray-600">Plan Amount:</span>
              <span className="font-medium">₹{selectedPlan?.price || '0'}</span>
            </div>
            
            {userDetails?.selectedTrainerId && (
              <div className="flex justify-between mb-1">
                <span className="text-gray-600">Trainer ({userDetails?.selectedTrainerName || 'N/A'}):</span>
                <span className="font-medium">₹{userDetails?.selectedTrainerFee || '0'}/session</span>
              </div>
            )}
            
            <div className="border-t border-gray-200 mt-2 pt-2">
              <div className="flex justify-between font-semibold">
                <span>Total to Pay Today:</span>
                <span>₹{selectedPlan?.price || '0'}</span>
              </div>
              {userDetails?.selectedTrainerId && (
                <p className="text-xs text-gray-500 mt-1">
                  * Trainer fee of ₹{userDetails?.selectedTrainerFee || '0'} will be charged per session separately
                </p>
              )}
            </div>
          </div>

          {/* Payment Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cardholder Name *
                </label>
                <input
                  type="text"
                  name="cardholderName"
                  value={paymentData.cardholderName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border ${errors.cardholderName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Name on card"
                />
                {errors.cardholderName && <p className="mt-1 text-sm text-red-600">{errors.cardholderName}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Number *
                </label>
                <input
                  type="text"
                  name="cardNumber"
                  value={paymentData.cardNumber}
                  onChange={handleCardNumberChange}
                  maxLength={19}
                  className={`w-full px-4 py-3 border ${errors.cardNumber ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="1234 5678 9012 3456"
                />
                {errors.cardNumber && <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date *
                </label>
                <input
                  type="text"
                  name="expiryDate"
                  value={paymentData.expiryDate}
                  onChange={handleInputChange}
                  maxLength={5}
                  className={`w-full px-4 py-3 border ${errors.expiryDate ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="MM/YY"
                />
                {errors.expiryDate && <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CVV *
                </label>
                <input
                  type="text"
                  name="cvv"
                  value={paymentData.cvv}
                  onChange={handleInputChange}
                  maxLength={3}
                  className={`w-full px-4 py-3 border ${errors.cvv ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="123"
                />
                {errors.cvv && <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>}
              </div>
            </div>

            {/* Test Card Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">Test Mode</h4>
              <p className="text-sm text-yellow-700">
                Use any test card number (e.g., 4242 4242 4242 4242), any future expiry date, and any 3-digit CVV.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                disabled={processing}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2 disabled:opacity-50"
                disabled={processing}
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    <span>Pay ₹{selectedPlan?.price || '0'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}