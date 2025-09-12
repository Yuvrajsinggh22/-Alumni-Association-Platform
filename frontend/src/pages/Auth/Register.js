import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const departments = [
  'Computer Science Engineering',
  'Electronics & Communication Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering',
  'Chemical Engineering',
  'Information Technology',
  'Biotechnology',
  'Aerospace Engineering',
  'Other'
];

const degrees = [
  'B.Tech',
  'M.Tech',
  'B.E.',
  'M.E.',
  'PhD',
  'Diploma',
  'Other'
];

const Register = () => {
  const [formData, setFormData] = useState({
     firstName: '',
     lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    graduationYear: '',
  // department removed
    degree: '',
    currentJob: '',
    currentCompany: '',
    location: '',
    bio: '',
    skills: '',
    interests: '',
    linkedinUrl: '',
    githubUrl: '',
    websiteUrl: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.firstName || !formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName || !formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, number, and special character';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!formData.graduationYear) {
      newErrors.graduationYear = 'Graduation year is required';
    } else if (formData.graduationYear < 1950 || formData.graduationYear > new Date().getFullYear()) {
      newErrors.graduationYear = 'Invalid graduation year';
    }

    // department validation removed

    if (!formData.degree) {
      newErrors.degree = 'Degree is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep2()) return;

    setLoading(true);
    

    // Convert skills and interests to arrays if not already
    const registrationData = {
      ...formData,
      graduationYear: parseInt(formData.graduationYear),
      skills: Array.isArray(formData.skills)
        ? formData.skills
        : (typeof formData.skills === 'string' && formData.skills.trim() !== ''
            ? formData.skills.split(',').map(s => s.trim()).filter(Boolean)
            : []),
      interests: Array.isArray(formData.interests)
        ? formData.interests
        : (typeof formData.interests === 'string' && formData.interests.trim() !== ''
            ? formData.interests.split(',').map(i => i.trim()).filter(Boolean)
            : [])
    };

    const result = await register(registrationData);
    
    if (result.success) {
      navigate('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
            <svg className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Join the Alumni Network
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Connect with fellow graduates from{' '}
            <span className="font-medium text-primary-600">
              Government Engineering College
            </span>
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center space-x-4">
          <div className={`flex items-center ${step >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <span className="ml-2 text-sm font-medium">Account Info</span>
          </div>
          <div className="w-8 h-px bg-gray-300"></div>
          <div className={`flex items-center ${step >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <span className="ml-2 text-sm font-medium">Profile Details</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name *</label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    className={`mt-1 input-field ${errors.firstName ? 'input-error' : ''}`}
                    placeholder="Enter your first name"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                  {errors.firstName && <p className="form-error">{errors.firstName}</p>}
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name *</label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    className={`mt-1 input-field ${errors.lastName ? 'input-error' : ''}`}
                    placeholder="Enter your last name"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                  {errors.lastName && <p className="form-error">{errors.lastName}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className={`mt-1 input-field ${errors.email ? 'input-error' : ''}`}
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && <p className="form-error">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="mt-1 input-field"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password *
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className={`input-field pr-10 ${errors.password ? 'input-error' : ''}`}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && <p className="form-error">{errors.password}</p>}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password *
                </label>
                <div className="mt-1 relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    className={`input-field pr-10 ${errors.confirmPassword ? 'input-error' : ''}`}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="w-full btn-primary"
              >
                Next Step
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="graduationYear" className="block text-sm font-medium text-gray-700">
                    Graduation Year *
                  </label>
                  <input
                    id="graduationYear"
                    name="graduationYear"
                    type="number"
                    min="1950"
                    max={new Date().getFullYear()}
                    required
                    className={`mt-1 input-field ${errors.graduationYear ? 'input-error' : ''}`}
                    placeholder="e.g., 2020"
                    value={formData.graduationYear}
                    onChange={handleChange}
                  />
                  {errors.graduationYear && <p className="form-error">{errors.graduationYear}</p>}
                </div>

                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                    Department *
                  </label>
                  <select
                    id="department"
                    name="department"
                    required
                    className={`mt-1 input-field ${errors.department ? 'input-error' : ''}`}
                    value={formData.department}
                    onChange={handleChange}
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  {errors.department && <p className="form-error">{errors.department}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="degree" className="block text-sm font-medium text-gray-700">
                  Degree *
                </label>
                <select
                  id="degree"
                  name="degree"
                  required
                  className={`mt-1 input-field ${errors.degree ? 'input-error' : ''}`}
                  value={formData.degree}
                  onChange={handleChange}
                >
                  <option value="">Select Degree</option>
                  {degrees.map(degree => (
                    <option key={degree} value={degree}>{degree}</option>
                  ))}
                </select>
                {errors.degree && <p className="form-error">{errors.degree}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="currentJob" className="block text-sm font-medium text-gray-700">
                    Current Job Title
                  </label>
                  <input
                    id="currentJob"
                    name="currentJob"
                    type="text"
                    className="mt-1 input-field"
                    placeholder="e.g., Software Engineer"
                    value={formData.currentJob}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="currentCompany" className="block text-sm font-medium text-gray-700">
                    Current Company
                  </label>
                  <input
                    id="currentCompany"
                    name="currentCompany"
                    type="text"
                    className="mt-1 input-field"
                    placeholder="e.g., Google"
                    value={formData.currentCompany}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  className="mt-1 input-field"
                  placeholder="e.g., Bangalore, India"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={3}
                  className="mt-1 input-field"
                  placeholder="Tell us about yourself..."
                  value={formData.bio}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
                  Skills (comma-separated)
                </label>
                <input
                  id="skills"
                  name="skills"
                  type="text"
                  className="mt-1 input-field"
                  placeholder="e.g., JavaScript, React, Node.js"
                  value={formData.skills}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="interests" className="block text-sm font-medium text-gray-700">
                  Interests (comma-separated)
                </label>
                <input
                  id="interests"
                  name="interests"
                  type="text"
                  className="mt-1 input-field"
                  placeholder="e.g., Technology, Sports, Music"
                  value={formData.interests}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="linkedinUrl" className="block text-sm font-medium text-gray-700">
                    LinkedIn URL
                  </label>
                  <input
                    id="linkedinUrl"
                    name="linkedinUrl"
                    type="url"
                    className="mt-1 input-field"
                    placeholder="https://linkedin.com/in/..."
                    value={formData.linkedinUrl}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-700">
                    GitHub URL
                  </label>
                  <input
                    id="githubUrl"
                    name="githubUrl"
                    type="url"
                    className="mt-1 input-field"
                    placeholder="https://github.com/..."
                    value={formData.githubUrl}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-700">
                    Website URL
                  </label>
                  <input
                    id="websiteUrl"
                    name="websiteUrl"
                    type="url"
                    className="mt-1 input-field"
                    placeholder="https://yourwebsite.com"
                    value={formData.websiteUrl}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 btn-secondary"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 btn-primary"
                >
                  {loading ? (
                    <LoadingSpinner size="small" />
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            </div>
          )}
        </form>

        <div className="text-center">
          <span className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Sign in here
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Register;
