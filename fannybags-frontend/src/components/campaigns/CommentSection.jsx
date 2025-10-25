import React, { useState, useEffect, useCallback } from 'react'; // ← ADD useCallback
import { FiMessageCircle, FiSend, FiTrash2, FiUser, FiCheckCircle } from 'react-icons/fi';
import { getComments, createComment, deleteComment } from '../../services/commentService';
import {useAuthStore} from '../../store/authStore';

const CommentSection = ({ campaignId }) => {
  const { user } = useAuthStore();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState(null);

  // 🔥 WRAP fetchComments in useCallback
  // This memoizes the function so it doesn't change on every render
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
  }, [campaignId]); // ← Only recreate if campaignId changes

  // Now useEffect is happy because fetchComments is in the dependency array
  useEffect(() => {
    fetchComments();
  }, [fetchComments]); // ← Include fetchComments

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
      
      // Add new comment to the top of the list
      setComments([response.comment, ...comments]);
      setNewComment(''); // Clear input
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
      // Remove comment from list
      setComments(comments.filter(c => c.id !== commentId));
      setError(null);
    } catch (err) {
      console.error('Failed to delete comment:', err);
      setError(err.response?.data?.error || 'Failed to delete comment');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <FiMessageCircle className="text-purple-600" size={24} />
        <h2 className="text-2xl font-bold text-gray-900">
          Comments ({comments.length})
        </h2>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
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
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                disabled={posting}
              />
              
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-500">
                  {newComment.length}/1000
                </span>
                
                <button
                  type="submit"
                  disabled={posting || !newComment.trim()}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiSend size={18} />
                  {posting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-gray-50 border border-gray-200 rounded-lg text-center text-gray-600">
          <a href="/login" className="text-purple-600 hover:underline font-semibold">
            Login
          </a> to join the conversation
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FiMessageCircle className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-lg">No comments yet</p>
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
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
                    <span className="text-white font-bold">
                      {comment.author.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Comment Content */}
              <div className="flex-1 min-w-0">
                {/* Author & Timestamp */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">
                    {comment.author.name}
                  </span>
                  
                  {/* Verified Badge */}
                  {comment.author.verified && (
                    <FiCheckCircle className="text-blue-500" size={16} title="Verified Artist" />
                  )}
                  
                  {/* Role Badge */}
                  {comment.author.role === 'artist' && (
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                      Artist
                    </span>
                  )}
                  
                  <span className="text-sm text-gray-500">
                    • {comment.time_ago}
                  </span>
                </div>

                {/* Comment Text */}
                <p className="text-gray-700 whitespace-pre-wrap break-words">
                  {comment.body}
                </p>
              </div>

              {/* Delete Button (only for own comments) */}
              {user && user.sub === comment.user_id && (
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-2 text-red-600 hover:bg-red-50 rounded-lg"
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