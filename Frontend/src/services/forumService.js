import axios from 'axios';
import { API_ENDPOINTS, getAuthHeaders } from './apiConfig';

/**
 * Get all forum posts
 */
export const getAllPosts = async () => {
  try {
    const response = await axios.get(API_ENDPOINTS.FORUM_POSTS, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

/**
 * Get a single post by ID
 */
export const getPost = async (postId) => {
  try {
    const response = await axios.get(API_ENDPOINTS.FORUM_POST(postId), {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching post:', error);
    throw error;
  }
};

/**
 * Create a new post
 */
export const createPost = async (postData) => {
  try {
    const response = await axios.post(
      API_ENDPOINTS.FORUM_POSTS,
      postData,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

/**
 * Delete a post
 */
export const deletePost = async (postId) => {
  try {
    const response = await axios.delete(API_ENDPOINTS.FORUM_POST(postId), {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

/**
 * Vote on a post (up or down)
 */
export const votePost = async (postId, userId, voteType) => {
  try {
    const response = await axios.post(
      API_ENDPOINTS.FORUM_VOTE(postId),
      { user_uid: userId, vote_type: voteType },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error('Error voting on post:', error);
    throw error;
  }
};

/**
 * Get comments for a post
 */
export const getComments = async (postId) => {
  try {
    const response = await axios.get(API_ENDPOINTS.FORUM_COMMENTS(postId), {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
};

/**
 * Create a new comment
 */
export const createComment = async (postId, commentData) => {
  try {
    const response = await axios.post(
      API_ENDPOINTS.FORUM_COMMENTS(postId),
      commentData,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
};

/**
 * Delete a comment
 */
export const deleteComment = async (postId, commentId) => {
  try {
    const response = await axios.delete(
      API_ENDPOINTS.FORUM_COMMENT(postId, commentId),
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};

/**
 * Get user profile
 */
export const getUserProfile = async (userId) => {
  try {
    const response = await axios.get(API_ENDPOINTS.FORUM_USER(userId), {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

/**
 * Create user profile
 */
export const createUserProfile = async (userData) => {
  try {
    const response = await axios.post(
      API_ENDPOINTS.FORUM_CREATE_USER,
      userData,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};
