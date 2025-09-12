import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { PencilIcon, CameraIcon } from '@heroicons/react/24/outline';
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

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    currentJob: user?.currentJob || '',
    currentCompany: user?.currentCompany || '',
    location: user?.location || '',
    bio: user?.bio || '',
    skills: user?.skills?.join(', ') || '',
    interests: user?.interests?.join(', ') || '',
    linkedinUrl: user?.linkedinUrl || '',
    githubUrl: user?.githubUrl || '',
    websiteUrl: user?.websiteUrl || '',
    isPublic: user?.isPublic ?? true
  });
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const updateData = {
      ...formData,
      skills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(s => s) : [],
      interests: formData.interests ? formData.interests.split(',').map(s => s.trim()).filter(s => s) : []
    };

    const result = await updateProfile(updateData);
    if (result.success) {
      setIsEditing(false);
    }
    setLoading(false);
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      currentJob: user?.currentJob || '',
      currentCompany: user?.currentCompany || '',
      location: user?.location || '',
      bio: user?.bio || '',
      skills: user?.skills?.join(', ') || '',
      interests: user?.interests?.join(', ') || '',
      linkedinUrl: user?.linkedinUrl || '',
      githubUrl: user?.githubUrl || '',
      websiteUrl: user?.websiteUrl || '',
      isPublic: user?.isPublic ?? true
    });
    setIsEditing(false);
  };
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="card">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <img
              className="h-24 w-24 rounded-full"
              src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.name}&background=3b82f6&color=fff&size=96`}
              alt={user?.name}
            />
            <button className="absolute bottom-0 right-0 bg-primary-600 rounded-full p-2 text-white hover:bg-primary-700">
              <CameraIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{user?.firstName} {user?.lastName}</h1>
            <p className="text-gray-600">
              {user?.graduationYear} Graduate • {user?.department}
            </p>
            <p className="text-gray-600">{user?.degree}</p>
            {user?.currentJob && user?.currentCompany && (
              <p className="text-gray-600 mt-1">
                {user.currentJob} at {user.currentCompany}
              </p>
            )}
            <div className="flex items-center mt-2 space-x-4">
              <span className={`badge ${user?.isVerified ? 'badge-success' : 'badge-warning'}`}>
                {user?.isVerified ? 'Verified' : 'Pending Verification'}
              </span>
              <span className={`badge ${user?.isPublic ? 'badge-primary' : 'badge-secondary'}`}>{user?.isPublic ? 'Public Profile' : 'Private Profile'}</span>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="btn-secondary flex items-center space-x-2"
          >
            <PencilIcon className="h-4 w-4" />
            <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
          </button>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">Basic Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                type="text"
                name="firstName"
                id="firstName"
                disabled={!isEditing}
                className={`mt-1 input-field ${!isEditing ? 'bg-gray-50' : ''}`}
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                name="lastName"
                id="lastName"
                disabled={!isEditing}
                className={`mt-1 input-field ${!isEditing ? 'bg-gray-50' : ''}`}
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                id="phone"
                disabled={!isEditing}
                className={`mt-1 input-field ${!isEditing ? 'bg-gray-50' : ''}`}
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                type="text"
                name="location"
                id="location"
                disabled={!isEditing}
                className={`mt-1 input-field ${!isEditing ? 'bg-gray-50' : ''}`}
                value={formData.location}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isPublic"
                  disabled={!isEditing}
                  checked={formData.isPublic}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Make profile public</span>
              </label>
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">Professional Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="currentJob" className="block text-sm font-medium text-gray-700">
                Current Job Title
              </label>
              <input
                type="text"
                name="currentJob"
                id="currentJob"
                disabled={!isEditing}
                className={`mt-1 input-field ${!isEditing ? 'bg-gray-50' : ''}`}
                value={formData.currentJob}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="currentCompany" className="block text-sm font-medium text-gray-700">
                Current Company
              </label>
              <input
                type="text"
                name="currentCompany"
                id="currentCompany"
                disabled={!isEditing}
                className={`mt-1 input-field ${!isEditing ? 'bg-gray-50' : ''}`}
                value={formData.currentCompany}
                onChange={handleChange}
              />
            </div>
          </div>
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
              Bio
            </label>
            <textarea
              name="bio"
              id="bio"
              rows={4}
              disabled={!isEditing}
              className={`mt-1 input-field ${!isEditing ? 'bg-gray-50' : ''}`}
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself..."
            />
          </div>
        </div>

        {/* Skills & Interests */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">Skills & Interests</h2>
          </div>
          <div className="space-y-6">
            <div>
              <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
                Skills (comma-separated)
              </label>
              <input
                type="text"
                name="skills"
                id="skills"
                disabled={!isEditing}
                className={`mt-1 input-field ${!isEditing ? 'bg-gray-50' : ''}`}
                value={formData.skills}
                onChange={handleChange}
                placeholder="e.g., JavaScript, React, Node.js"
              />
            </div>
            <div>
              <label htmlFor="interests" className="block text-sm font-medium text-gray-700">
                Interests (comma-separated)
              </label>
              <input
                type="text"
                name="interests"
                id="interests"
                disabled={!isEditing}
                className={`mt-1 input-field ${!isEditing ? 'bg-gray-50' : ''}`}
                value={formData.interests}
                onChange={handleChange}
                placeholder="e.g., Technology, Sports, Music"
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">Social Links</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="linkedinUrl" className="block text-sm font-medium text-gray-700">
                LinkedIn URL
              </label>
              <input
                type="url"
                name="linkedinUrl"
                id="linkedinUrl"
                disabled={!isEditing}
                className={`mt-1 input-field ${!isEditing ? 'bg-gray-50' : ''}`}
                value={formData.linkedinUrl}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/..."
              />
            </div>
            <div>
              <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-700">
                GitHub URL
              </label>
              <input
                type="url"
                name="githubUrl"
                id="githubUrl"
                disabled={!isEditing}
                className={`mt-1 input-field ${!isEditing ? 'bg-gray-50' : ''}`}
                value={formData.githubUrl}
                onChange={handleChange}
                placeholder="https://github.com/..."
              />
            </div>
            <div>
              <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-700">
                Website URL
              </label>
              <input
                type="url"
                name="websiteUrl"
                id="websiteUrl"
                disabled={!isEditing}
                className={`mt-1 input-field ${!isEditing ? 'bg-gray-50' : ''}`}
                value={formData.websiteUrl}
                onChange={handleChange}
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleCancel}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? <LoadingSpinner size="small" /> : 'Save Changes'}
            </button>
          </div>
        )}
      </form>

      {/* Academic Information (Read-only) */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-medium text-gray-900">Academic Information</h2>
          <p className="text-sm text-gray-500">This information cannot be changed. Contact admin if corrections are needed.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Graduation Year</label>
            <div className="mt-1 text-sm text-gray-900">{user?.graduationYear}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Department</label>
            <div className="mt-1 text-sm text-gray-900">{user?.department}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Degree</label>
            <div className="mt-1 text-sm text-gray-900">{user?.degree}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
