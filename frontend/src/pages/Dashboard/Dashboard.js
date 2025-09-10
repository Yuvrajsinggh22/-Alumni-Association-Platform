import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import {
  UserGroupIcon,
  BriefcaseIcon,
  CalendarIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { user } = useAuth();

  const quickActions = [
    {
      name: 'Browse Alumni',
      description: 'Connect with fellow graduates',
      href: '/alumni',
      icon: UserGroupIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Find Jobs',
      description: 'Explore career opportunities',
      href: '/jobs',
      icon: BriefcaseIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Upcoming Events',
      description: 'Join alumni gatherings',
      href: '/events',
      icon: CalendarIcon,
      color: 'bg-purple-500',
    },
    {
      name: 'Make Donation',
      description: 'Support your alma mater',
      href: '/donations',
      icon: HeartIcon,
      color: 'bg-red-500',
    },
    {
      name: 'Messages',
      description: 'Chat with connections',
      href: '/messages',
      icon: ChatBubbleLeftRightIcon,
      color: 'bg-indigo-500',
    },
    {
      name: 'Success Stories',
      description: 'Share your achievements',
      href: '/success-stories',
      icon: TrophyIcon,
      color: 'bg-yellow-500',
    },
  ];

  const stats = [
    { name: 'Alumni Connected', value: '2,847', change: '+12%', changeType: 'positive' },
    { name: 'Job Opportunities', value: '156', change: '+8%', changeType: 'positive' },
    { name: 'Upcoming Events', value: '12', change: '+3%', changeType: 'positive' },
    { name: 'Total Donations', value: '₹5.2L', change: '+15%', changeType: 'positive' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="mt-2 text-primary-100">
              {user?.graduationYear} Graduate • {user?.department}
            </p>
            {!user?.isVerified && (
              <div className="mt-4 bg-yellow-500 bg-opacity-20 border border-yellow-300 rounded-lg p-3">
                <p className="text-sm">
                  ⏳ Your account is pending verification. You'll have full access once approved by our admin team.
                </p>
              </div>
            )}
          </div>
          <div className="hidden md:block">
            <img
              className="h-20 w-20 rounded-full border-4 border-white shadow-lg"
              src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.name}&background=fff&color=3b82f6&size=80`}
              alt={user?.name}
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
              <div className={`text-sm ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.name}
                to={action.href}
                className="card hover:shadow-card-hover transition-shadow duration-200 group"
              >
                <div className="flex items-center">
                  <div className={`${action.color} p-3 rounded-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900 group-hover:text-primary-600">
                      {action.name}
                    </h3>
                    <p className="text-sm text-gray-500">{action.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Recent Job Postings</h3>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((job) => (
              <div key={job} className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center">
                    <BriefcaseIcon className="h-5 w-5 text-gray-500" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    Software Engineer at Tech Corp
                  </p>
                  <p className="text-sm text-gray-500">Posted 2 days ago</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Link
              to="/jobs"
              className="text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              View all jobs →
            </Link>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Upcoming Events</h3>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((event) => (
              <div key={event} className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <CalendarIcon className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    Annual Alumni Meetup 2024
                  </p>
                  <p className="text-sm text-gray-500">March 15, 2024</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Link
              to="/events"
              className="text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              View all events →
            </Link>
          </div>
        </div>
      </div>

      {/* Profile Completion */}
      {user && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Complete Your Profile</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Profile completion</span>
              <span className="text-sm font-medium text-gray-900">75%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-primary-600 h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
            <div className="text-sm text-gray-600">
              Add your profile picture and update your current job information to reach 100%
            </div>
            <Link
              to="/profile"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200"
            >
              Complete Profile
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
