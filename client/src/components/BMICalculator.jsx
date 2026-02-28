import React, { useState } from 'react';
import { Calculator } from 'lucide-react';

export default function BMICalculator() {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bmi, setBMI] = useState(null);
  const [category, setCategory] = useState('');

  const calculateBMI = () => {
    const heightInM = parseFloat(height) / 100;
    const weightInKg = parseFloat(weight);
    
    if (heightInM > 0 && weightInKg > 0) {
      const calculatedBMI = weightInKg / (heightInM * heightInM);
      setBMI(Math.round(calculatedBMI * 10) / 10);
      
      if (calculatedBMI < 18.5) {
        setCategory('Underweight');
      } else if (calculatedBMI < 25) {
        setCategory('Normal weight');
      } else if (calculatedBMI < 30) {
        setCategory('Overweight');
      } else {
        setCategory('Obese');
      }
    }
  };

  const getBMIColor = () => {
    if (!bmi) return 'text-gray-600';
    if (bmi < 18.5) return 'text-blue-600';
    if (bmi < 25) return 'text-green-600';
    if (bmi < 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">BMI Calculator</h2>
          <p className="text-lg md:text-xl text-gray-600">Check your Body Mass Index to track your fitness journey</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Height (cm)
                </label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your height in cm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your weight in kg"
                />
              </div>

              <button
                onClick={calculateBMI}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 text-sm md:text-base"
              >
                <Calculator className="h-5 w-5" />
                <span>Calculate BMI</span>
              </button>
            </div>

            <div className="flex items-center justify-center">
              {bmi ? (
                <div className="text-center">
                  <div className={`text-4xl md:text-6xl font-bold mb-4 ${getBMIColor()}`}>
                    {bmi}
                  </div>
                  <div className={`text-xl md:text-2xl font-semibold mb-2 ${getBMIColor()}`}>
                    {category}
                  </div>
                  <div className="text-gray-600">
                    BMI Categories:
                    <div className="mt-4 text-sm space-y-1">
                      <div className="text-blue-600">Underweight: Below 18.5</div>
                      <div className="text-green-600">Normal: 18.5 - 24.9</div>
                      <div className="text-yellow-600">Overweight: 25 - 29.9</div>
                      <div className="text-red-600">Obese: 30 and above</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  <Calculator className="h-16 md:h-24 w-16 md:w-24 mx-auto mb-4" />
                  <p className="text-sm md:text-base">Enter your height and weight to calculate BMI</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}