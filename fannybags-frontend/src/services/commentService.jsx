import api from './api';

/**
 * Fetch all comments for a campaign
 * @param {number} campaignId - The campaign ID
 * @returns {Promise} - Response with comments array
 */
export const getComments = async (campaignId) => {
  const response = await api.get(`/campaigns/${campaignId}/comments`);
  return response.data;
};

/**
 * Post a new comment on a campaign
 * @param {number} campaignId - The campaign ID
 * @param {string} body - The comment text
 * @returns {Promise} - Response with created comment
 */
export const createComment = async (campaignId, body) => {
  const response = await api.post(`/campaigns/${campaignId}/comments`, { body });
  return response.data;
};

/**
 * Delete a comment
 * @param {number} commentId - The comment ID to delete
 * @returns {Promise} - Response confirming deletion
 */
export const deleteComment = async (commentId) => {
  const response = await api.delete(`/comments/${commentId}`);
  return response.data;
};