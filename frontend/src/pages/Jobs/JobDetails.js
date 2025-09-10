import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import {
  MapPinIcon,
  BriefcaseIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserIcon,
  LinkIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const JobDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);

  const { data: jobData, isLoading, error } = useQuery(
    ['job', id],
    async () => {
      const response = await axios.get(`/api/jobs/${id}`);
      return response.data;
    }
  );

  const applyMutation = useMutation(
    async (applicationData) => {
      const response = await axios.post(`/api/jobs/${id}/apply`, applicationData);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Application submitted successfully!');
        setShowApplicationForm(false);
        setCoverLetter('');
        queryClient.invalidateQueries(['job', id]);
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to submit application');
      },
    }
  );

  const handleApply = async (e) => {
    e.preventDefault();
    setApplying(true);
    await applyMutation.mutateAsync({ coverLetter });
    setApplying(false);
  };

  const jobTypes = {
    FULL_TIME: 'Full Time',
    PART_TIME: 'Part Time',
    CONTRACT: 'Contract',
    INTERNSHIP: 'Internship',
    FREELANCE: 'Freelance',
  };

  const experienceLevels = {
    ENTRY_LEVEL: 'Entry Level',
    MID_LEVEL: 'Mid Level',
    SENIOR_LEVEL: 'Senior Level',
    EXECUTIVE: 'Executive',
  };

  const getJobTypeColor = (type) => {
    const colors = {
      FULL_TIME: 'bg-green-100 text-green-800',
      PART_TIME: 'bg-blue-100 text-blue-800',
      CONTRACT: 'bg-purple-100 text-purple-800',
      INTERNSHIP: 'bg-yellow-100 text-yellow-800',
      FREELANCE: 'bg-pink-100 text-pink-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getExperienceColor = (level) => {
    const colors = {
      ENTRY_LEVEL: 'bg-green-100 text-green-800',
      MID_LEVEL: 'bg-blue-100 text-blue-800',
      SENIOR_LEVEL: 'bg-purple-100 text-purple-800',
      EXECUTIVE: 'bg-red-100 text-red-800',
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
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
        <p className="text-red-600">Error loading job details</p>
      </div>
    );
  }

  const job = jobData?.job;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <Link
        to="/jobs"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-1" />
        Back to Jobs
      </Link>

      {/* Job Header */}
      <div className="card">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <img
              className="h-16 w-16 rounded-lg"
              src={`https://ui-avatars.com/api/?name=${job?.company}&background=3b82f6&color=fff&size=64`}
              alt={job?.company}
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{job?.title}</h1>
              <p className="text-lg text-gray-600 font-medium">{job?.company}</p>
              
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <div className="flex items-center">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  {job?.location}
                </div>
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  Posted {new Date(job?.createdAt).toLocaleDateString()}
                </div>
                {job?.salary && (
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                    {job.salary}
                  </div>
                )}
              </div>

              <div className="flex space-x-2 mt-3">
                <span className={`badge ${getJobTypeColor(job?.jobType)}`}>
                  {jobTypes[job?.jobType] || job?.jobType}
                </span>
                <span className={`badge ${getExperienceColor(job?.experienceLevel)}`}>
                  {experienceLevels[job?.experienceLevel] || job?.experienceLevel}
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm text-gray-500 mb-2">
              {job?._count?.applications || 0} applications
            </div>
            {user && job && user.id !== job.postedBy?.id && (
              <div className="space-y-2">
                {job.hasApplied ? (
                  <span className="badge badge-success">Applied</span>
                ) : (
                  <button
                    onClick={() => setShowApplicationForm(true)}
                    className="btn-primary"
                  >
                    Apply Now
                  </button>
                )}
                {job.applicationUrl && (
                  <div>
                    <a
                      href={job.applicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <LinkIcon className="h-4 w-4" />
                      <span>External Apply</span>
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Application Form Modal */}
      {showApplicationForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Apply for {job?.title}
              </h3>
              <form onSubmit={handleApply}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Letter (Optional)
                  </label>
                  <textarea
                    rows={4}
                    className="input-field"
                    placeholder="Tell the employer why you're interested in this position..."
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowApplicationForm(false)}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={applying}
                    className="flex-1 btn-primary"
                  >
                    {applying ? <LoadingSpinner size="small" /> : 'Submit Application'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Job Description */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-medium text-gray-900">Job Description</h2>
        </div>
        <div className="prose max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap">{job?.description}</p>
        </div>
      </div>

      {/* Required Skills */}
      {job?.skills && job.skills.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">Required Skills</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {job.skills.map((skill, index) => (
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

      {/* Posted By */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-medium text-gray-900">Posted By</h2>
        </div>
        <div className="flex items-center space-x-4">
          <img
            className="h-12 w-12 rounded-full"
            src={job?.postedBy?.profilePicture || `https://ui-avatars.com/api/?name=${job?.postedBy?.name}&background=3b82f6&color=fff&size=48`}
            alt={job?.postedBy?.name}
          />
          <div>
            <Link
              to={`/alumni/${job?.postedBy?.id}`}
              className="text-lg font-medium text-gray-900 hover:text-primary-600"
            >
              {job?.postedBy?.name}
            </Link>
            <p className="text-sm text-gray-500">
              {job?.postedBy?.graduationYear} Graduate • {job?.postedBy?.department}
            </p>
            {job?.postedBy?.currentCompany && (
              <p className="text-sm text-gray-600">
                {job?.postedBy?.currentJob} at {job?.postedBy?.currentCompany}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Similar Jobs */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-medium text-gray-900">Similar Jobs</h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <BriefcaseIcon className="h-8 w-8 text-gray-400" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">
                  Senior Software Engineer
                </h4>
                <p className="text-sm text-gray-500">Tech Corp • Remote</p>
              </div>
              <Link
                to={`/jobs/${item}`}
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                View →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
