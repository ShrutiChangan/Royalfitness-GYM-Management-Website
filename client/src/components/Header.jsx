import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Dumbbell, User, LogOut, Menu, X } from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'member': return '/member-dashboard';
      case 'trainer': return '/trainer-dashboard';
      case 'admin': return '/admin-dashboard';
      default: return '/';
    }
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-3"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Dumbbell className="h-10 w-10 text-blue-600" />
            <span className="text-2xl md:text-3xl font-bold text-gray-900">RoyalFitness</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 items-center">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-lg px-3 py-2"
            >
              Home
            </Link>
            <a 
              href="#services" 
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-lg px-3 py-2"
            >
              Services
            </a>
            <a 
              href="#plans" 
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-lg px-3 py-2"
            >
              Plans
            </a>
            <a 
              href="#trainers" 
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-lg px-3 py-2"
            >
              Trainers
            </a>
            <a 
              href="#contact" 
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-lg px-3 py-2"
            >
              Contact
            </a>
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to={getDashboardLink()}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg"
                >
                  <User className="h-5 w-5" />
                  <span className="hidden sm:inline font-medium">{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="hidden sm:inline font-medium">Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
              >
                Login
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-3 rounded-lg text-gray-700 hover:bg-gray-100 ml-2"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-6 bg-white">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-lg px-6 py-3"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <a 
                href="#services" 
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-lg px-6 py-3"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Services
              </a>
              <a 
                href="#plans" 
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-lg px-6 py-3"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Plans
              </a>
              <a 
                href="#trainers" 
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-lg px-6 py-3"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Trainers
              </a>
              <a 
                href="#contact" 
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-lg px-6 py-3"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </a>
              
              {/* Mobile user actions */}
              {user && (
                <div className="border-t border-gray-200 pt-4 mt-4 px-6">
                  <Link
                    to={getDashboardLink()}
                    className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors font-medium text-lg py-3"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="h-6 w-6" />
                    <span>Dashboard</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 text-gray-700 hover:text-red-600 transition-colors font-medium text-lg py-3 w-full"
                  >
                    <LogOut className="h-6 w-6" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}