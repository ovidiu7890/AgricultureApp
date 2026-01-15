import { API_ENDPOINTS, getAuthHeaders } from './apiConfig';

/**
 * Send a message to the AI chat
 * @param {string} question - The user's question
 * @returns {Promise<{answer: string, citations: string[], error: string|null}>}
 */
export const sendChatMessage = async (question) => {
  try {
    const response = await fetch(API_ENDPOINTS.CHAT, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ question }),
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
