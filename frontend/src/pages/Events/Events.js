import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from 'axios';
import {
  MagnifyingGlassIcon,
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const Events = () => {
  const [filters, setFilters] = useState({
    search: '',
    upcoming: 'true',
    page: 1,
    limit: 20,
  });

  const { data, isLoading, error } = useQuery(
    ['events', filters],
    async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const response = await axios.get(`/api/events?${params}`);
      return response.data;
    },
    {
      keepPreviousData: true,
    }
  );

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getRegistrationStatus = (event) => {
    if (!event.userRegistrationStatus) return null;
    
    const statusColors = {
      REGISTERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      WAITLISTED: 'bg-yellow-100 text-yellow-800',
    };

    const statusLabels = {
      REGISTERED: 'Registered',
      CANCELLED: 'Cancelled',
      WAITLISTED: 'Waitlisted',
    };

    return (
      <span className={`badge ${statusColors[event.userRegistrationStatus]}`}>
        {statusLabels[event.userRegistrationStatus]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events & Reunions</h1>
          <p className="mt-1 text-sm text-gray-500">
            Discover {data?.pagination?.total || 0} upcoming events and reunions
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                className="input-field pl-10"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleFilterChange('upcoming', 'true')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                filters.upcoming === 'true'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => handleFilterChange('upcoming', 'false')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                filters.upcoming === 'false'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Past Events
            </button>
          </div>
        </div>
      </div>

      {/* Events List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="large" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600">Error loading events</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.events?.map((event) => (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="card hover:shadow-card-hover transition-shadow duration-200 group"
              >
                {event.image && (
                  <div className="aspect-w-16 aspect-h-9 mb-4">
                    <img
                      className="w-full h-48 object-cover rounded-lg"
                      src={event.image}
                      alt={event.title}
                    />
                  </div>
                )}
                
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 line-clamp-2">
                      {event.title}
                    </h3>
                    {getRegistrationStatus(event)}
                  </div>

                  <p className="text-gray-600 text-sm line-clamp-3">
                    {event.description}
                  </p>

                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{formatDate(event.eventDate)} at {formatTime(event.eventDate)}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <MapPinIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <UserGroupIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{event._count?.registrations || 0} registered</span>
                      </div>
                      
                      {event.ticketPrice > 0 && (
                        <div className="flex items-center">
                          <CurrencyDollarIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                          <span className="font-medium">${event.ticketPrice}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {new Date(event.eventDate) > new Date() ? (
                          <>
                            <ClockIcon className="h-3 w-3 inline mr-1" />
                            {Math.ceil((new Date(event.eventDate) - new Date()) / (1000 * 60 * 60 * 24))} days to go
                          </>
                        ) : (
                          'Event completed'
                        )}
                      </span>
                      {event.ticketPrice === 0 && (
                        <span className="text-xs font-medium text-green-600">Free</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {data?.pagination && data.pagination.pages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
                  disabled={filters.page === 1}
                  className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => handleFilterChange('page', Math.min(data.pagination.pages, filters.page + 1))}
                  disabled={filters.page === data.pagination.pages}
                  className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{' '}
                    <span className="font-medium">
                      {(filters.page - 1) * filters.limit + 1}
                    </span>{' '}
                    to{' '}
                    <span className="font-medium">
                      {Math.min(filters.page * filters.limit, data.pagination.total)}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium">{data.pagination.total}</span>{' '}
                    results
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                    <button
                      onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
                      disabled={filters.page === 1}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.min(5, data.pagination.pages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => handleFilterChange('page', page)}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                            page === filters.page
                              ? 'z-10 bg-primary-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600'
                              : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => handleFilterChange('page', Math.min(data.pagination.pages, filters.page + 1))}
                      disabled={filters.page === data.pagination.pages}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {data?.events?.length === 0 && (
            <div className="text-center py-12">
              <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No events found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filters.upcoming === 'true' 
                  ? 'No upcoming events at the moment. Check back later!'
                  : 'No past events to display.'
                }
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Events;
