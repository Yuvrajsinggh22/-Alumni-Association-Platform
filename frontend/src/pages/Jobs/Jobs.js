import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from 'axios';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  MapPinIcon,
  BriefcaseIcon,
  ClockIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const Jobs = () => {
  const [filters, setFilters] = useState({
    search: '',
    jobType: '',
    experienceLevel: '',
    location: '',
    skills: '',
    page: 1,
    limit: 20,
  });
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, error } = useQuery(
    ['jobs', filters],
    async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const response = await axios.get(`/api/jobs?${params}`);
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

  const jobTypes = [
    { value: 'FULL_TIME', label: 'Full Time' },
    { value: 'PART_TIME', label: 'Part Time' },
    { value: 'CONTRACT', label: 'Contract' },
    { value: 'INTERNSHIP', label: 'Internship' },
    { value: 'FREELANCE', label: 'Freelance' },
  ];

  const experienceLevels = [
    { value: 'ENTRY_LEVEL', label: 'Entry Level' },
    { value: 'MID_LEVEL', label: 'Mid Level' },
    { value: 'SENIOR_LEVEL', label: 'Senior Level' },
    { value: 'EXECUTIVE', label: 'Executive' },
  ];

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Opportunities</h1>
          <p className="mt-1 text-sm text-gray-500">
            Discover {data?.pagination?.total || 0} job opportunities from the alumni network
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary flex items-center space-x-2"
          >
            <FunnelIcon className="h-4 w-4" />
            <span>Filters</span>
          </button>
          <Link to="/jobs/post" className="btn-primary flex items-center space-x-2">
            <PlusIcon className="h-4 w-4" />
            <span>Post Job</span>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs by title, company, or skills..."
                className="input-field pl-10"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Type
                </label>
                <select
                  className="input-field"
                  value={filters.jobType}
                  onChange={(e) => handleFilterChange('jobType', e.target.value)}
                >
                  <option value="">All Types</option>
                  {jobTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experience Level
                </label>
                <select
                  className="input-field"
                  value={filters.experienceLevel}
                  onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
                >
                  <option value="">All Levels</option>
                  {experienceLevels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="City, Country"
                  className="input-field"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skills
                </label>
                <input
                  type="text"
                  placeholder="Required skills"
                  className="input-field"
                  value={filters.skills}
                  onChange={(e) => handleFilterChange('skills', e.target.value)}
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setFilters({
                  search: '',
                  jobType: '',
                  experienceLevel: '',
                  location: '',
                  skills: '',
                  page: 1,
                  limit: 20,
                })}
                className="btn-secondary"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Jobs List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="large" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600">Error loading jobs</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {data?.jobs?.map((job) => (
              <Link
                key={job.id}
                to={`/jobs/${job.id}`}
                className="card hover:shadow-card-hover transition-shadow duration-200 group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start space-x-4">
                      <img
                        className="h-12 w-12 rounded-lg"
                        src={`https://ui-avatars.com/api/?name=${job.company}&background=3b82f6&color=fff&size=48`}
                        alt={job.company}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600">
                          {job.title}
                        </h3>
                        <p className="text-gray-600 font-medium">{job.company}</p>
                        
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <div className="flex items-center">
                            <MapPinIcon className="h-4 w-4 mr-1" />
                            {job.location}
                          </div>
                          <div className="flex items-center">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            {new Date(job.createdAt).toLocaleDateString()}
                          </div>
                          {job.salary && (
                            <div className="flex items-center">
                              <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                              {job.salary}
                            </div>
                          )}
                        </div>

                        <p className="text-gray-700 mt-2 line-clamp-2">
                          {job.description}
                        </p>

                        {/* Skills */}
                        {job.skills && job.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {job.skills.slice(0, 5).map((skill, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                              >
                                {skill}
                              </span>
                            ))}
                            {job.skills.length > 5 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                +{job.skills.length - 5} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    <div className="flex space-x-2">
                      <span className={`badge ${getJobTypeColor(job.jobType)}`}>
                        {jobTypes.find(t => t.value === job.jobType)?.label || job.jobType}
                      </span>
                      <span className={`badge ${getExperienceColor(job.experienceLevel)}`}>
                        {experienceLevels.find(l => l.value === job.experienceLevel)?.label || job.experienceLevel}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      {job._count?.applications || 0} applications
                    </div>
                    
                    <div className="text-xs text-gray-400">
                      Posted by {job.postedBy?.name}
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
          {data?.jobs?.length === 0 && (
            <div className="text-center py-12">
              <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search criteria or filters.
              </p>
              <div className="mt-6">
                <Link to="/jobs/post" className="btn-primary">
                  Post the first job
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Jobs;
