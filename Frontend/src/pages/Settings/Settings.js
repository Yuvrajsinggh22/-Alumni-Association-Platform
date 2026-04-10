import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useMutation } from 'react-query';
import axios from 'axios';
import {
  UserIcon,
  LockClosedIcon,
  BellIcon,
  EyeIcon,
  EyeSlashIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Profile Settings State
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    currentPosition: user?.currentPosition || '',
    currentCompany: user?.currentCompany || '',
    location: user?.location || '',
    website: user?.website || '',
    linkedinUrl: user?.linkedinUrl || '',
    twitterUrl: user?.twitterUrl || '',
    githubUrl: user?.githubUrl || '',
  });

  // Password Change State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Privacy Settings State
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: user?.profileVisibility || 'PUBLIC',
    showEmail: user?.showEmail || false,
    showPhone: user?.showPhone || false,
    allowMessages: user?.allowMessages !== false,
  });

  // Notification Settings State
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    jobAlerts: true,
    eventNotifications: true,
    messageNotifications: true,
    followNotifications: true,
  });

  const updateProfileMutation = useMutation(
    async (data) => {
      const response = await axios.put('/api/auth/profile', data);
      return response.data;
    },
    {
      onSuccess: (data) => {
        updateProfile(data.user);
        toast.success('Profile updated successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to update profile');
      },
    }
  );

  const changePasswordMutation = useMutation(
    async (data) => {
      const response = await axios.put('/api/auth/change-password', data);
      return response.data;
    },
    {
      onSuccess: () => {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        toast.success('Password changed successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to change password');
      },
    }
  );

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    await updateProfileMutation.mutateAsync(profileData);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    await changePasswordMutation.mutateAsync({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };

  const handlePrivacySubmit = async (e) => {
    e.preventDefault();
    await updateProfileMutation.mutateAsync(privacySettings);
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'security', name: 'Security', icon: LockClosedIcon },
    { id: 'privacy', name: 'Privacy', icon: EyeIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="flex flex-col lg:flex-row lg:space-x-8">
        {/* Sidebar */}
        <div className="lg:w-64">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === tab.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 mt-6 lg:mt-0">
          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>
                <p className="text-sm text-gray-500">
                  Update your personal information and professional details
                </p>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      className="mt-1 input-field"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      className="mt-1 input-field"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="mt-1 input-field"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    className="mt-1 input-field"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    rows={4}
                    className="mt-1 input-field"
                    placeholder="Tell us about yourself..."
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="currentPosition" className="block text-sm font-medium text-gray-700">
                      Current Position
                    </label>
                    <input
                      type="text"
                      id="currentPosition"
                      className="mt-1 input-field"
                      value={profileData.currentPosition}
                      onChange={(e) => setProfileData(prev => ({ ...prev, currentPosition: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label htmlFor="currentCompany" className="block text-sm font-medium text-gray-700">
                      Current Company
                    </label>
                    <input
                      type="text"
                      id="currentCompany"
                      className="mt-1 input-field"
                      value={profileData.currentCompany}
                      onChange={(e) => setProfileData(prev => ({ ...prev, currentCompany: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    className="mt-1 input-field"
                    value={profileData.location}
                    onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Social Links
                  </label>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="website" className="block text-xs font-medium text-gray-600">
                        Website
                      </label>
                      <input
                        type="url"
                        id="website"
                        className="mt-1 input-field"
                        placeholder="https://yourwebsite.com"
                        value={profileData.website}
                        onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label htmlFor="linkedinUrl" className="block text-xs font-medium text-gray-600">
                        LinkedIn
                      </label>
                      <input
                        type="url"
                        id="linkedinUrl"
                        className="mt-1 input-field"
                        placeholder="https://linkedin.com/in/username"
                        value={profileData.linkedinUrl}
                        onChange={(e) => setProfileData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label htmlFor="twitterUrl" className="block text-xs font-medium text-gray-600">
                        Twitter
                      </label>
                      <input
                        type="url"
                        id="twitterUrl"
                        className="mt-1 input-field"
                        placeholder="https://twitter.com/username"
                        value={profileData.twitterUrl}
                        onChange={(e) => setProfileData(prev => ({ ...prev, twitterUrl: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label htmlFor="githubUrl" className="block text-xs font-medium text-gray-600">
                        GitHub
                      </label>
                      <input
                        type="url"
                        id="githubUrl"
                        className="mt-1 input-field"
                        placeholder="https://github.com/username"
                        value={profileData.githubUrl}
                        onChange={(e) => setProfileData(prev => ({ ...prev, githubUrl: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={updateProfileMutation.isLoading}
                    className="btn-primary"
                  >
                    {updateProfileMutation.isLoading ? (
                      <LoadingSpinner size="small" />
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-medium text-gray-900">Change Password</h2>
                <p className="text-sm text-gray-500">
                  Update your password to keep your account secure
                </p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                    Current Password
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      id="currentPassword"
                      className="input-field pr-10"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      id="newPassword"
                      className="input-field pr-10"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm New Password
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      className="input-field pr-10"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
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
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={changePasswordMutation.isLoading}
                    className="btn-primary"
                  >
                    {changePasswordMutation.isLoading ? (
                      <LoadingSpinner size="small" />
                    ) : (
                      'Change Password'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Privacy Settings */}
          {activeTab === 'privacy' && (
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-medium text-gray-900">Privacy Settings</h2>
                <p className="text-sm text-gray-500">
                  Control who can see your information and contact you
                </p>
              </div>

              <form onSubmit={handlePrivacySubmit} className="space-y-6">
                <div>
                  <label htmlFor="profileVisibility" className="block text-sm font-medium text-gray-700">
                    Profile Visibility
                  </label>
                  <select
                    id="profileVisibility"
                    className="mt-1 input-field"
                    value={privacySettings.profileVisibility}
                    onChange={(e) => setPrivacySettings(prev => ({ ...prev, profileVisibility: e.target.value }))}
                  >
                    <option value="PUBLIC">Public - Visible to everyone</option>
                    <option value="ALUMNI_ONLY">Alumni Only - Visible to verified alumni</option>
                    <option value="PRIVATE">Private - Only visible to connections</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      id="showEmail"
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      checked={privacySettings.showEmail}
                      onChange={(e) => setPrivacySettings(prev => ({ ...prev, showEmail: e.target.checked }))}
                    />
                    <label htmlFor="showEmail" className="ml-2 block text-sm text-gray-900">
                      Show email address on profile
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="showPhone"
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      checked={privacySettings.showPhone}
                      onChange={(e) => setPrivacySettings(prev => ({ ...prev, showPhone: e.target.checked }))}
                    />
                    <label htmlFor="showPhone" className="ml-2 block text-sm text-gray-900">
                      Show phone number on profile
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="allowMessages"
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      checked={privacySettings.allowMessages}
                      onChange={(e) => setPrivacySettings(prev => ({ ...prev, allowMessages: e.target.checked }))}
                    />
                    <label htmlFor="allowMessages" className="ml-2 block text-sm text-gray-900">
                      Allow other alumni to send me messages
                    </label>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={updateProfileMutation.isLoading}
                    className="btn-primary"
                  >
                    {updateProfileMutation.isLoading ? (
                      <LoadingSpinner size="small" />
                    ) : (
                      'Save Privacy Settings'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-medium text-gray-900">Notification Preferences</h2>
                <p className="text-sm text-gray-500">
                  Choose what notifications you want to receive
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                      <p className="text-sm text-gray-500">Receive notifications via email</p>
                    </div>
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      checked={notificationSettings.emailNotifications}
                      onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Job Alerts</h4>
                      <p className="text-sm text-gray-500">Get notified about new job postings</p>
                    </div>
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      checked={notificationSettings.jobAlerts}
                      onChange={(e) => setNotificationSettings(prev => ({ ...prev, jobAlerts: e.target.checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Event Notifications</h4>
                      <p className="text-sm text-gray-500">Get notified about upcoming events</p>
                    </div>
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      checked={notificationSettings.eventNotifications}
                      onChange={(e) => setNotificationSettings(prev => ({ ...prev, eventNotifications: e.target.checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Message Notifications</h4>
                      <p className="text-sm text-gray-500">Get notified about new messages</p>
                    </div>
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      checked={notificationSettings.messageNotifications}
                      onChange={(e) => setNotificationSettings(prev => ({ ...prev, messageNotifications: e.target.checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Follow Notifications</h4>
                      <p className="text-sm text-gray-500">Get notified when someone follows you</p>
                    </div>
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      checked={notificationSettings.followNotifications}
                      onChange={(e) => setNotificationSettings(prev => ({ ...prev, followNotifications: e.target.checked }))}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => toast.success('Notification preferences saved')}
                  >
                    Save Notification Settings
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
