import { useState } from 'react';
import { campaignService } from '../../services/campaignService';

export default function CreateCampaignForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_amount: 10000,
    revenue_share_pct: 50,
    partition_price: 1000,
    expected_streams_3m: 100000,
    expected_revenue_3m: 25000,
    sharing_term: '2 years',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: isNaN(value) ? value : parseFloat(value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await campaignService.createCampaign(formData);
      setSuccess(`Campaign "${result.title}" created successfully!`);
      setFormData({
        title: '',
        description: '',
        target_amount: 10000,
        revenue_share_pct: 50,
        partition_price: 1000,
        expected_streams_3m: 100000,
        expected_revenue_3m: 25000,
        sharing_term: '2 years',
      });
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-fb-surface p-8 rounded-lg">
      <h2 className="text-2xl font-bold mb-6">Create New Campaign</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-500 text-white rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-fb-green text-white rounded">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Campaign Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-fb-dark text-white border border-gray-600 rounded focus:outline-none focus:border-fb-pink"
              placeholder="My Awesome Song"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Target Amount (₹) *</label>
            <input
              type="number"
              name="target_amount"
              value={formData.target_amount}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-fb-dark text-white border border-gray-600 rounded focus:outline-none focus:border-fb-pink"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-fb-dark text-white border border-gray-600 rounded focus:outline-none focus:border-fb-pink"
            placeholder="Tell investors about your song..."
            rows="4"
          ></textarea>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Revenue Share (%) *</label>
            <input
              type="number"
              name="revenue_share_pct"
              value={formData.revenue_share_pct}
              onChange={handleChange}
              min="1"
              max="100"
              className="w-full px-4 py-2 bg-fb-dark text-white border border-gray-600 rounded focus:outline-none focus:border-fb-pink"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Partition Price (₹) *</label>
            <input
              type="number"
              name="partition_price"
              value={formData.partition_price}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-fb-dark text-white border border-gray-600 rounded focus:outline-none focus:border-fb-pink"
              required
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Expected Streams (3m)</label>
            <input
              type="number"
              name="expected_streams_3m"
              value={formData.expected_streams_3m}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-fb-dark text-white border border-gray-600 rounded focus:outline-none focus:border-fb-pink"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Expected Revenue (₹) (3m)</label>
            <input
              type="number"
              name="expected_revenue_3m"
              value={formData.expected_revenue_3m}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-fb-dark text-white border border-gray-600 rounded focus:outline-none focus:border-fb-pink"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Revenue Sharing Term</label>
          <input
            type="text"
            name="sharing_term"
            value={formData.sharing_term}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-fb-dark text-white border border-gray-600 rounded focus:outline-none focus:border-fb-pink"
            placeholder="e.g., 2 years"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-fb-pink text-white rounded font-semibold hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Campaign'}
        </button>
      </form>
    </div>
  );
}