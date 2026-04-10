import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import {
  ArrowLeftIcon,
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ShareIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  const { data: event, isLoading, error } = useQuery(
    ['event', id],
    async () => {
      const response = await axios.get(`/api/events/${id}`);
      return response.data.event;
    }
  );

  const registerMutation = useMutation(
    async () => {
      const response = await axios.post(`/api/events/${id}/register`);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Successfully registered for the event!');
        queryClient.invalidateQueries(['event', id]);
        setShowRegistrationModal(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to register for event');
      },
    }
  );

  const cancelRegistrationMutation = useMutation(
    async () => {
      const response = await axios.delete(`/api/events/${id}/register`);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Registration cancelled successfully');
        queryClient.invalidateQueries(['event', id]);
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to cancel registration');
      },
    }
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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

  const getRegistrationStatus = () => {
    if (!event?.userRegistrationStatus) return null;
    
    const statusConfig = {
      REGISTERED: {
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        icon: CheckCircleIcon,
        label: 'Registered',
      },
      CANCELLED: {
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        icon: XCircleIcon,
        label: 'Cancelled',
      },
      WAITLISTED: {
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        icon: ClockIcon,
        label: 'Waitlisted',
      },
    };

    const config = statusConfig[event.userRegistrationStatus];
    const Icon = config.icon;

    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color} ${config.bgColor}`}>
        <Icon className="h-4 w-4 mr-1" />
        {config.label}
      </div>
    );
  };

  const canRegister = () => {
    if (!event) return false;
    const now = new Date();
    const eventDate = new Date(event.eventDate);
    const registrationDeadline = new Date(event.registrationDeadline);
    
    return (
      eventDate > now &&
      registrationDeadline > now &&
      !event.userRegistrationStatus &&
      event._count.registrations < event.maxAttendees
    );
  };

  const canCancelRegistration = () => {
    return event?.userRegistrationStatus === 'REGISTERED';
  };

  const shareEvent = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to copying URL
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Event link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Event not found</p>
        <button
          onClick={() => navigate('/events')}
          className="mt-4 btn-primary"
        >
          Back to Events
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/events')}
          className="p-2 text-gray-400 hover:text-gray-600"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
            <button
              onClick={shareEvent}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <ShareIcon className="h-5 w-5" />
            </button>
          </div>
          {getRegistrationStatus()}
        </div>
      </div>

      {/* Event Image */}
      {event.image && (
        <div className="aspect-w-16 aspect-h-9">
          <img
            className="w-full h-64 object-cover rounded-lg"
            src={event.image}
            alt={event.title}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Details */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-medium text-gray-900">Event Details</h2>
            </div>
            <div className="prose max-w-none">
              <p className="text-gray-600 whitespace-pre-wrap">{event.description}</p>
            </div>
          </div>

          {/* Organizer */}
          {event.organizer && (
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-medium text-gray-900">Organized by</h2>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-600">
                    {event.organizer.firstName[0]}{event.organizer.lastName[0]}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {event.organizer.firstName} {event.organizer.lastName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {event.organizer.currentPosition} at {event.organizer.currentCompany}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Event Info */}
          <div className="card">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(event.eventDate)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatTime(event.eventDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Location</p>
                  <p className="text-sm text-gray-500">{event.location}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <UserGroupIcon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Attendees</p>
                  <p className="text-sm text-gray-500">
                    {event._count.registrations} / {event.maxAttendees} registered
                  </p>
                </div>
              </div>

              {event.ticketPrice > 0 && (
                <div className="flex items-start space-x-3">
                  <CurrencyDollarIcon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Ticket Price</p>
                    <p className="text-sm text-gray-500">${event.ticketPrice}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start space-x-3">
                <ClockIcon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Registration Deadline</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(event.registrationDeadline)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Registration Actions */}
          <div className="card">
            {canRegister() ? (
              <button
                onClick={() => setShowRegistrationModal(true)}
                className="w-full btn-primary"
              >
                {event.ticketPrice > 0 ? `Register - $${event.ticketPrice}` : 'Register for Free'}
              </button>
            ) : canCancelRegistration() ? (
              <button
                onClick={() => cancelRegistrationMutation.mutate()}
                disabled={cancelRegistrationMutation.isLoading}
                className="w-full btn-secondary"
              >
                {cancelRegistrationMutation.isLoading ? (
                  <LoadingSpinner size="small" />
                ) : (
                  'Cancel Registration'
                )}
              </button>
            ) : (
              <div className="text-center py-4">
                {event.userRegistrationStatus ? (
                  <p className="text-sm text-gray-500">
                    You are {event.userRegistrationStatus.toLowerCase()} for this event
                  </p>
                ) : new Date(event.eventDate) <= new Date() ? (
                  <p className="text-sm text-gray-500">This event has ended</p>
                ) : new Date(event.registrationDeadline) <= new Date() ? (
                  <p className="text-sm text-gray-500">Registration deadline has passed</p>
                ) : event._count.registrations >= event.maxAttendees ? (
                  <p className="text-sm text-gray-500">Event is full</p>
                ) : (
                  <p className="text-sm text-gray-500">Registration not available</p>
                )}
              </div>
            )}
          </div>

          {/* Event Stats */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-sm font-medium text-gray-900">Event Statistics</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Registered</span>
                <span className="font-medium">{event._count.registrations}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Available Spots</span>
                <span className="font-medium">
                  {event.maxAttendees - event._count.registrations}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full"
                  style={{
                    width: `${Math.min(100, (event._count.registrations / event.maxAttendees) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      {showRegistrationModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirm Registration
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to register for "{event.title}"?
              {event.ticketPrice > 0 && (
                <span className="block mt-2 font-medium">
                  Ticket Price: ${event.ticketPrice}
                </span>
              )}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowRegistrationModal(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => registerMutation.mutate()}
                disabled={registerMutation.isLoading}
                className="flex-1 btn-primary"
              >
                {registerMutation.isLoading ? (
                  <LoadingSpinner size="small" />
                ) : (
                  'Confirm Registration'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetails;
