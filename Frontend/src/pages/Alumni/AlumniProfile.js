import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from 'axios';
import {
  MapPinIcon,
  BriefcaseIcon,
  CalendarIcon,
  LinkIcon,
  ChatBubbleLeftRightIcon,
  UserPlusIcon,
  UserMinusIcon,
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const AlumniProfile = () => {
  const { id } = useParams();

  const { data: profileData, isLoading, error } = useQuery(
    ['alumni-profile', id],
    async () => {
      const response = await axios.get(`/api/alumni/${id}`);
      return response.data;
    }
  );

  const handleFollow = async () => {
    try {
      await axios.post(`/api/alumni/${id}/follow`);
      // Refetch profile data to update follow status
      window.location.reload();
    } catch (error) {
      console.error('Follow error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading profile</p>
      </div>
    );
  }

  const alumni = profileData?.alumni;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-6">
          <div className="flex-shrink-0">
            <img
              className="h-32 w-32 rounded-full mx-auto sm:mx-0"
              src={alumni?.profilePicture || `https://ui-avatars.com/api/?name=${alumni?.name}&background=3b82f6&color=fff&size=128`}
              alt={alumni?.name}
            />
          </div>
          <div className="flex-1 mt-4 sm:mt-0 text-center sm:text-left">
            <h1 className="text-3xl font-bold text-gray-900">{alumni?.name}</h1>
            <p className="text-lg text-gray-600 mt-1">
              {alumni?.graduationYear} Graduate • {alumni?.department}
            </p>
            <p className="text-gray-600">{alumni?.degree}</p>
            
            {alumni?.currentJob && alumni?.currentCompany && (
              <div className="flex items-center justify-center sm:justify-start mt-2 text-gray-700">
                <BriefcaseIcon className="h-5 w-5 mr-2" />
                <span>{alumni.currentJob} at {alumni.currentCompany}</span>
              </div>
            )}
            
            {alumni?.location && (
              <div className="flex items-center justify-center sm:justify-start mt-1 text-gray-700">
                <MapPinIcon className="h-5 w-5 mr-2" />
                <span>{alumni.location}</span>
              </div>
            )}

            {/* Stats */}
            <div className="flex justify-center sm:justify-start space-x-6 mt-4">
              <div className="text-center">
                <div className="text-xl font-semibold text-gray-900">
                  {alumni?._count?.followers || 0}
                </div>
                <div className="text-sm text-gray-500">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-semibold text-gray-900">
                  {alumni?._count?.following || 0}
                </div>
                <div className="text-sm text-gray-500">Following</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-semibold text-gray-900">
                  {alumni?._count?.postedJobs || 0}
                </div>
                <div className="text-sm text-gray-500">Jobs Posted</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center sm:justify-start space-x-3 mt-6">
              <button
                onClick={handleFollow}
                className={`btn-primary flex items-center space-x-2 ${
                  alumni?.isFollowing ? 'bg-gray-600 hover:bg-gray-700' : ''
                }`}
              >
                {alumni?.isFollowing ? (
                  <>
                    <UserMinusIcon className="h-4 w-4" />
                    <span>Unfollow</span>
                  </>
                ) : (
                  <>
                    <UserPlusIcon className="h-4 w-4" />
                    <span>Follow</span>
                  </>
                )}
              </button>
              <Link
                to={`/messages?user=${alumni?.id}`}
                className="btn-secondary flex items-center space-x-2"
              >
                <ChatBubbleLeftRightIcon className="h-4 w-4" />
                <span>Message</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bio */}
      {alumni?.bio && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">About</h2>
          </div>
          <p className="text-gray-700 leading-relaxed">{alumni.bio}</p>
        </div>
      )}

      {/* Skills & Interests */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {alumni?.skills && alumni.skills.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-medium text-gray-900">Skills</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {alumni.skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {alumni?.interests && alumni.interests.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-medium text-gray-900">Interests</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {alumni.interests.map((interest, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Social Links */}
      {(alumni?.linkedinUrl || alumni?.githubUrl || alumni?.websiteUrl) && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">Connect</h2>
          </div>
          <div className="space-y-3">
            {alumni.linkedinUrl && (
              <a
                href={alumni.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 text-gray-700 hover:text-primary-600 transition-colors"
              >
                <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                  <LinkIcon className="h-4 w-4 text-white" />
                </div>
                <span>LinkedIn Profile</span>
              </a>
            )}
            {alumni.githubUrl && (
              <a
                href={alumni.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 text-gray-700 hover:text-primary-600 transition-colors"
              >
                <div className="w-8 h-8 bg-gray-900 rounded flex items-center justify-center">
                  <LinkIcon className="h-4 w-4 text-white" />
                </div>
                <span>GitHub Profile</span>
              </a>
            )}
            {alumni.websiteUrl && (
              <a
                href={alumni.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 text-gray-700 hover:text-primary-600 transition-colors"
              >
                <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                  <LinkIcon className="h-4 w-4 text-white" />
                </div>
                <span>Personal Website</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Academic Information */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-medium text-gray-900">Academic Background</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center space-x-2 text-gray-700">
              <CalendarIcon className="h-5 w-5" />
              <span className="font-medium">Graduation Year</span>
            </div>
            <p className="mt-1 text-gray-900">{alumni?.graduationYear}</p>
          </div>
          <div>
            <div className="flex items-center space-x-2 text-gray-700">
              <BriefcaseIcon className="h-5 w-5" />
              <span className="font-medium">Department</span>
            </div>
            <p className="mt-1 text-gray-900">{alumni?.department}</p>
          </div>
          <div>
            <div className="flex items-center space-x-2 text-gray-700">
              <BriefcaseIcon className="h-5 w-5" />
              <span className="font-medium">Degree</span>
            </div>
            <p className="mt-1 text-gray-900">{alumni?.degree}</p>
          </div>
        </div>
      </div>

      {/* Member Since */}
      <div className="text-center text-sm text-gray-500">
        Member since {new Date(alumni?.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long'
        })}
      </div>
    </div>
  );
};

export default AlumniProfile;
