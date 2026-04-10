import React, { useState } from 'react';
import { useQuery, useMutation } from 'react-query';
import axios from 'axios';
import {
  HeartIcon,
  CurrencyDollarIcon,
  TrophyIcon,
  UserGroupIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const Donations = () => {
  const [donationAmount, setDonationAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('stripe');

  const predefinedAmounts = [25, 50, 100, 250, 500, 1000];

  const { data: donationStats, isLoading: statsLoading } = useQuery(
    'donation-stats',
    async () => {
      const response = await axios.get('/api/donations/stats');
      return response.data;
    }
  );

  const { data: recentDonations, isLoading: donationsLoading } = useQuery(
    'recent-donations',
    async () => {
      const response = await axios.get('/api/donations?limit=10');
      return response.data;
    }
  );

  const createPaymentMutation = useMutation(
    async (donationData) => {
      const endpoint = paymentMethod === 'stripe' 
        ? '/api/donations/stripe/create-payment-intent'
        : '/api/donations/razorpay/create-order';
      
      const response = await axios.post(endpoint, donationData);
      return response.data;
    },
    {
      onSuccess: (data) => {
        if (paymentMethod === 'stripe') {
          handleStripePayment(data);
        } else {
          handleRazorpayPayment(data);
        }
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to create payment');
      },
    }
  );

  const handleStripePayment = async (paymentData) => {
    // In a real implementation, you would use Stripe Elements here
    toast.success('Stripe payment integration would be implemented here');
    setShowDonationForm(false);
    resetForm();
  };

  const handleRazorpayPayment = async (orderData) => {
    // In a real implementation, you would use Razorpay SDK here
    toast.success('Razorpay payment integration would be implemented here');
    setShowDonationForm(false);
    resetForm();
  };

  const resetForm = () => {
    setDonationAmount('');
    setCustomAmount('');
    setDonorName('');
    setMessage('');
    setIsAnonymous(false);
  };

  const handleAmountSelect = (amount) => {
    setDonationAmount(amount.toString());
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value;
    setCustomAmount(value);
    setDonationAmount(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const amount = parseFloat(donationAmount);
    if (!amount || amount < 1) {
      toast.error('Please enter a valid donation amount');
      return;
    }

    const donationData = {
      amount,
      donorName: isAnonymous ? null : donorName,
      message,
      isAnonymous,
    };

    await createPaymentMutation.mutateAsync(donationData);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <HeartSolidIcon className="mx-auto h-12 w-12 text-red-500" />
        <h1 className="mt-4 text-3xl font-bold text-gray-900">Support Our Alumni Community</h1>
        <p className="mt-2 text-lg text-gray-600">
          Your donations help us build stronger connections and create more opportunities for our alumni network.
        </p>
      </div>

      {/* Stats */}
      {statsLoading ? (
        <div className="flex justify-center">
          <LoadingSpinner size="large" />
        </div>
      ) : donationStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card text-center">
            <CurrencyDollarIcon className="mx-auto h-8 w-8 text-green-500" />
            <div className="mt-2">
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(donationStats.totalAmount || 0)}
              </p>
              <p className="text-sm text-gray-500">Total Raised</p>
            </div>
          </div>
          
          <div className="card text-center">
            <UserGroupIcon className="mx-auto h-8 w-8 text-blue-500" />
            <div className="mt-2">
              <p className="text-2xl font-bold text-gray-900">
                {donationStats.totalDonors || 0}
              </p>
              <p className="text-sm text-gray-500">Generous Donors</p>
            </div>
          </div>
          
          <div className="card text-center">
            <TrophyIcon className="mx-auto h-8 w-8 text-yellow-500" />
            <div className="mt-2">
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(donationStats.averageAmount || 0)}
              </p>
              <p className="text-sm text-gray-500">Average Donation</p>
            </div>
          </div>
          
          <div className="card text-center">
            <CalendarIcon className="mx-auto h-8 w-8 text-purple-500" />
            <div className="mt-2">
              <p className="text-2xl font-bold text-gray-900">
                {donationStats.thisMonthCount || 0}
              </p>
              <p className="text-sm text-gray-500">This Month</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Donation Form */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900">Make a Donation</h2>
              <p className="text-sm text-gray-500">
                Every contribution makes a difference in our alumni community
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Amount Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Amount
                </label>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {predefinedAmounts.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => handleAmountSelect(amount)}
                      className={`p-3 text-center border rounded-lg font-medium transition-colors ${
                        donationAmount === amount.toString()
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      ${amount}
                    </button>
                  ))}
                </div>
                
                <div>
                  <label htmlFor="customAmount" className="block text-sm font-medium text-gray-700 mb-1">
                    Or enter custom amount
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      id="customAmount"
                      min="1"
                      step="0.01"
                      className="input-field pl-7"
                      placeholder="0.00"
                      value={customAmount}
                      onChange={handleCustomAmountChange}
                    />
                  </div>
                </div>
              </div>

              {/* Donor Information */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    id="anonymous"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                  />
                  <label htmlFor="anonymous" className="ml-2 block text-sm text-gray-900">
                    Make this donation anonymous
                  </label>
                </div>

                {!isAnonymous && (
                  <div>
                    <label htmlFor="donorName" className="block text-sm font-medium text-gray-700">
                      Display Name (Optional)
                    </label>
                    <input
                      type="text"
                      id="donorName"
                      className="mt-1 input-field"
                      placeholder="How should we display your name?"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    Message (Optional)
                  </label>
                  <textarea
                    id="message"
                    rows={3}
                    className="mt-1 input-field"
                    placeholder="Share a message with the community..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('stripe')}
                    className={`p-3 text-center border rounded-lg font-medium transition-colors ${
                      paymentMethod === 'stripe'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    Stripe
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('razorpay')}
                    className={`p-3 text-center border rounded-lg font-medium transition-colors ${
                      paymentMethod === 'razorpay'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    Razorpay
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!donationAmount || createPaymentMutation.isLoading}
                className="w-full btn-primary"
              >
                {createPaymentMutation.isLoading ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <>
                    <HeartIcon className="h-5 w-5 mr-2" />
                    Donate {donationAmount ? formatCurrency(parseFloat(donationAmount)) : ''}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Recent Donations */}
        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Recent Donations</h3>
            </div>
            
            {donationsLoading ? (
              <div className="flex justify-center py-4">
                <LoadingSpinner size="medium" />
              </div>
            ) : recentDonations?.donations?.length > 0 ? (
              <div className="space-y-4">
                {recentDonations.donations.map((donation) => (
                  <div key={donation.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                        <HeartIcon className="h-4 w-4 text-red-500" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {donation.isAnonymous ? 'Anonymous' : (donation.donorName || 'Anonymous')}
                        </p>
                        <p className="text-sm font-semibold text-green-600">
                          {formatCurrency(donation.amount)}
                        </p>
                      </div>
                      {donation.message && (
                        <p className="text-sm text-gray-600 mt-1">"{donation.message}"</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(donation.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                No donations yet. Be the first to contribute!
              </p>
            )}
          </div>

          {/* Impact Statement */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Your Impact</h3>
            </div>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start space-x-2">
                <div className="h-2 w-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Support networking events and reunions</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="h-2 w-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Fund mentorship programs for recent graduates</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="h-2 w-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Maintain and improve the alumni platform</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="h-2 w-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Provide scholarships for current students</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donations;
