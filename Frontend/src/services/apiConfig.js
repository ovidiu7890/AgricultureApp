// API Configuration
const API_BASE_URL = 'http://localhost:5000';

export const API_ENDPOINTS = {
  // Forum endpoints
  FORUM_POSTS: `${API_BASE_URL}/api/forum/posts`,
  FORUM_POST: (postId) => `${API_BASE_URL}/api/forum/posts/${postId}`,
  FORUM_COMMENTS: (postId) => `${API_BASE_URL}/api/forum/posts/${postId}/comments`,
  FORUM_COMMENT: (postId, commentId) => `${API_BASE_URL}/api/forum/posts/${postId}/comments/${commentId}`,
  FORUM_VOTE: (postId) => `${API_BASE_URL}/api/forum/posts/${postId}/vote`,
  FORUM_USER: (userId) => `${API_BASE_URL}/api/forum/users/${userId}`,
  FORUM_CREATE_USER: `${API_BASE_URL}/api/forum/users`,
  
  // Calendar endpoints
  CALENDAR: `${API_BASE_URL}/api/calendar/`,
  CALENDAR_ENTRY: (entryId) => `${API_BASE_URL}/api/calendar/${entryId}`,
};

export const getAuthHeaders = () => {
  // TODO: Replace with actual auth token when Firebase is implemented
  return {
    'Content-Type': 'application/json',
  };
};

export default API_BASE_URL;
