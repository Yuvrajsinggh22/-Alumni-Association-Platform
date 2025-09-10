import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Bars3Icon, BellIcon } from '@heroicons/react/24/outline';

const Header = ({ setSidebarOpen }) => {
  const { user } = useAuth();

  return (
    <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow">
      <button
        type="button"
        className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <Bars3Icon className="h-6 w-6" />
      </button>
      
      <div className="flex-1 px-4 flex justify-between">
        <div className="flex-1 flex">
          <div className="w-full flex md:ml-0">
            <div className="relative w-full text-gray-400 focus-within:text-gray-600">
              {/* Search can be added here later */}
            </div>
          </div>
        </div>
        
        <div className="ml-4 flex items-center md:ml-6">
          {/* Notifications */}
          <button
            type="button"
            className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <BellIcon className="h-6 w-6" />
          </button>

          {/* Profile dropdown */}
          <div className="ml-3 relative">
            <div className="flex items-center">
              <img
                className="h-8 w-8 rounded-full"
                src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.name}&background=3b82f6&color=fff`}
                alt={user?.name}
              />
              <span className="ml-2 text-sm font-medium text-gray-700 hidden md:block">
                {user?.name}
              </span>
              {!user?.isVerified && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Pending Verification
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
