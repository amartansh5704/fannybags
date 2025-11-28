import React, { useState, useEffect, useCallback } from 'react';
import { FiMessageCircle, FiSend, FiTrash2, FiUser, FiCheckCircle } from 'react-icons/fi';
import { getComments, createComment, deleteComment } from '../../services/commentService';
import { useAuthStore } from '../../store/authStore';

const CommentSection = ({ campaignId }) => {
  const { user } = useAuthStore();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState(null);

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getComments(campaignId);
      setComments(data.comments || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handlePostComment = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please login to comment');
      return;
    }

    if (!newComment.trim()) {
      return;
    }

    try {
      setPosting(true);
      const response = await createComment(campaignId, newComment.trim());
      setComments([response.comment, ...comments]);
      setNewComment('');
      setError(null);
    } catch (err) {
      console.error('Failed to post comment:', err);
      setError(err.response?.data?.error || 'Failed to post comment');
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await deleteComment(commentId);
      setComments(comments.filter(c => c.id !== commentId));
      setError(null);
    } catch (err) {
      console.error('Failed to delete comment:', err);
      setError(err.response?.data?.error || 'Failed to delete comment');
    }
  };

  return (
    <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <FiMessageCircle className="text-[#FF48B9]" size={24} />
        <h2 className="text-2xl font-bold text-white">
          Comments ({comments.length})
        </h2>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {/* Comment Input Form */}
      {user ? (
        <form onSubmit={handlePostComment} className="mb-8">
          <div className="flex gap-3">
            {/* User Avatar */}
            <div className="flex-shrink-0">
              {user.profile_image_url ? (
                <img
                  src={user.profile_image_url}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#FF48B9] to-[#8B5CF6] flex items-center justify-center">
                  <FiUser className="text-white" size={20} />
                </div>
              )}
            </div>

            {/* Input Field */}
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                rows="3"
                maxLength="1000"
                className="w-full px-4 py-3 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-[#FF48B9] focus:border-transparent resize-none outline-none"
                disabled={posting}
              />
              
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-500">
                  {newComment.length}/1000
                </span>
                
                <button
                  type="submit"
                  disabled={posting || !newComment.trim()}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#FF48B9] to-[#8B5CF6] text-white font-semibold rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiSend size={18} />
                  {posting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg text-center text-gray-400">
          <a href="/login" className="text-[#FF48B9] hover:underline font-semibold">
            Login
          </a> to join the conversation
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF48B9]"></div>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FiMessageCircle className="mx-auto mb-4 text-gray-600" size={48} />
          <p className="text-lg text-gray-400">No comments yet</p>
          <p className="text-sm">Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-4 group">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {comment.author.profile_image_url ? (
                  <img
                    src={comment.author.profile_image_url}
                    alt={comment.author.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#FF48B9] flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {comment.author.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Comment Content */}
              <div className="flex-1 min-w-0">
                {/* Author & Timestamp */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-white">
                    {comment.author.name}
                  </span>
                  
                  {/* Verified Badge */}
                  {comment.author.verified && (
                    <FiCheckCircle className="text-blue-400" size={16} title="Verified Artist" />
                  )}
                  
                  {/* Role Badge */}
                  {comment.author.role === 'artist' && (
                    <span className="px-2 py-0.5 bg-[#8B5CF6]/20 text-[#8B5CF6] text-xs font-medium rounded-full border border-[#8B5CF6]/30">
                      Artist
                    </span>
                  )}
                  
                  <span className="text-sm text-gray-500">
                    • {comment.time_ago}
                  </span>
                </div>

                {/* Comment Text */}
                <p className="text-gray-300 whitespace-pre-wrap break-words">
                  {comment.body}
                </p>
              </div>

              {/* Delete Button */}
              {user && user.sub === comment.user_id && (
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                  title="Delete comment"
                >
                  <FiTrash2 size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;