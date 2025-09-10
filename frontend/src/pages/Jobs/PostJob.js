import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from 'react-query';
import axios from 'axios';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const PostJob = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company: '',
    location: '',
    jobType: '',
    experienceLevel: '',
    skills: '',
    salary: '',
    applicationUrl: '',
  });
  const [errors, setErrors] = useState({});

  const postJobMutation = useMutation(
    async (jobData) => {
      const response = await axios.post('/api/jobs', jobData);
      return response.data;
    },
    {
      onSuccess: (data) => {
        toast.success('Job posted successfully!');
        navigate(`/jobs/${data.job.id}`);
      },
      onError: (error) => {
        const errorData = error.response?.data;
        if (errorData?.details) {
          const newErrors = {};
          errorData.details.forEach(detail => {
            newErrors[detail.field] = detail.message;
          });
          setErrors(newErrors);
        } else {
          toast.error(errorData?.error || 'Failed to post job');
        }
      },
    }
  );

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const jobData = {
      ...formData,
      skills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(s => s) : []
    };

    await postJobMutation.mutateAsync(jobData);
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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/jobs')}
          className="p-2 text-gray-400 hover:text-gray-600"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Post a Job</h1>
          <p className="text-sm text-gray-500">
            Share job opportunities with the alumni network
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">Job Information</h2>
          </div>
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Job Title *
              </label>
              <input
                type="text"
                name="title"
                id="title"
                required
                className={`mt-1 input-field ${errors.title ? 'input-error' : ''}`}
                placeholder="e.g., Senior Software Engineer"
                value={formData.title}
                onChange={handleChange}
              />
              {errors.title && <p className="form-error">{errors.title}</p>}
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                Company *
              </label>
              <input
                type="text"
                name="company"
                id="company"
                required
                className={`mt-1 input-field ${errors.company ? 'input-error' : ''}`}
                placeholder="e.g., Google"
                value={formData.company}
                onChange={handleChange}
              />
              {errors.company && <p className="form-error">{errors.company}</p>}
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location *
              </label>
              <input
                type="text"
                name="location"
                id="location"
                required
                className={`mt-1 input-field ${errors.location ? 'input-error' : ''}`}
                placeholder="e.g., San Francisco, CA or Remote"
                value={formData.location}
                onChange={handleChange}
              />
              {errors.location && <p className="form-error">{errors.location}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="jobType" className="block text-sm font-medium text-gray-700">
                  Job Type *
                </label>
                <select
                  name="jobType"
                  id="jobType"
                  required
                  className={`mt-1 input-field ${errors.jobType ? 'input-error' : ''}`}
                  value={formData.jobType}
                  onChange={handleChange}
                >
                  <option value="">Select job type</option>
                  {jobTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                {errors.jobType && <p className="form-error">{errors.jobType}</p>}
              </div>

              <div>
                <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-700">
                  Experience Level *
                </label>
                <select
                  name="experienceLevel"
                  id="experienceLevel"
                  required
                  className={`mt-1 input-field ${errors.experienceLevel ? 'input-error' : ''}`}
                  value={formData.experienceLevel}
                  onChange={handleChange}
                >
                  <option value="">Select experience level</option>
                  {experienceLevels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
                {errors.experienceLevel && <p className="form-error">{errors.experienceLevel}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="salary" className="block text-sm font-medium text-gray-700">
                Salary Range (Optional)
              </label>
              <input
                type="text"
                name="salary"
                id="salary"
                className="mt-1 input-field"
                placeholder="e.g., $80,000 - $120,000 or Competitive"
                value={formData.salary}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Job Description */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">Job Description</h2>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description *
            </label>
            <textarea
              name="description"
              id="description"
              rows={8}
              required
              className={`mt-1 input-field ${errors.description ? 'input-error' : ''}`}
              placeholder="Describe the role, responsibilities, requirements, and what makes this opportunity exciting..."
              value={formData.description}
              onChange={handleChange}
            />
            {errors.description && <p className="form-error">{errors.description}</p>}
            <p className="mt-2 text-sm text-gray-500">
              Be detailed about the role, responsibilities, and requirements. This helps candidates understand if they're a good fit.
            </p>
          </div>
        </div>

        {/* Skills & Application */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">Requirements & Application</h2>
          </div>
          <div className="space-y-6">
            <div>
              <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
                Required Skills *
              </label>
              <input
                type="text"
                name="skills"
                id="skills"
                required
                className={`mt-1 input-field ${errors.skills ? 'input-error' : ''}`}
                placeholder="e.g., JavaScript, React, Node.js, Python"
                value={formData.skills}
                onChange={handleChange}
              />
              {errors.skills && <p className="form-error">{errors.skills}</p>}
              <p className="mt-1 text-sm text-gray-500">
                Separate skills with commas
              </p>
            </div>

            <div>
              <label htmlFor="applicationUrl" className="block text-sm font-medium text-gray-700">
                External Application URL (Optional)
              </label>
              <input
                type="url"
                name="applicationUrl"
                id="applicationUrl"
                className="mt-1 input-field"
                placeholder="https://company.com/careers/job-id"
                value={formData.applicationUrl}
                onChange={handleChange}
              />
              <p className="mt-1 text-sm text-gray-500">
                If you have an external application process, provide the URL. Otherwise, candidates can apply directly through the platform.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/jobs')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={postJobMutation.isLoading}
            className="btn-primary"
          >
            {postJobMutation.isLoading ? (
              <LoadingSpinner size="small" />
            ) : (
              'Post Job'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostJob;
