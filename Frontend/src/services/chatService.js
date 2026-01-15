import { API_ENDPOINTS, getAuthHeaders } from './apiConfig';

/**
 * Send a message to the AI chat with conversation history
 * @param {string} question - The user's question
 * @param {string} conversationId - Optional conversation ID for persistence
 * @param {string} userId - User's Firebase ID
 * @param {Array} history - Array of previous messages [{role, content}]
 * @returns {Promise<{answer: string, citations: string[], conversationId: string, error: string|null}>}
 */
export const sendChatMessage = async (question, conversationId = null, userId = 'anonymous', history = []) => {
  try {
    const response = await fetch(API_ENDPOINTS.CHAT, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ 
        question, 
        conversationId,
        userId,
        history 
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to get response from AI');
    }
    
    return data;
  } catch (error) {
    console.error('Chat service error:', error);
    throw error;
  }
};

/**
 * Get all conversations for a user
 * @param {string} userId - User's Firebase ID
 * @returns {Promise<{conversations: Array, error: string|null}>}
 */
export const getConversations = async (userId) => {
  try {
    const response = await fetch(`${API_ENDPOINTS.CHAT}/conversations?userId=${userId}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return { conversations: [], error: error.message };
  }
};

/**
 * Get messages for a specific conversation
 * @param {string} conversationId - The conversation ID
 * @returns {Promise<{messages: Array, error: string|null}>}
 */
export const getConversationMessages = async (conversationId) => {
  try {
    const response = await fetch(`${API_ENDPOINTS.CHAT}/conversations/${conversationId}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching messages:', error);
    return { messages: [], error: error.message };
  }
};

/**
 * Check the health of the chat API
 * @returns {Promise<{status: string, rag_initialized: boolean, error: string|null}>}
 */
export const checkChatHealth = async () => {
  try {
    const response = await fetch(API_ENDPOINTS.CHAT_HEALTH);
    return await response.json();
  } catch (error) {
    console.error('Chat health check error:', error);
    return { status: 'unavailable', rag_initialized: false, error: error.message };
  }
};
