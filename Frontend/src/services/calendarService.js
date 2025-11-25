import axios from 'axios';
import { API_ENDPOINTS, getAuthHeaders } from './apiConfig';

/**
 * Get all calendar entries for a user
 */
export const getCalendarEntries = async (userId) => {
  try {
    const response = await axios.get(API_ENDPOINTS.CALENDAR, {
      headers: getAuthHeaders(),
      params: { userId },  // Send as query parameter, not body
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching calendar entries:', error);
    throw error;
  }
};

/**
 * Create a new calendar entry
 */
export const createCalendarEntry = async (entryData) => {
  try {
    const response = await axios.post(
      API_ENDPOINTS.CALENDAR,
      entryData,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating calendar entry:', error);
    throw error;
  }
};

/**
 * Update a calendar entry
 */
export const updateCalendarEntry = async (entryId, entryData) => {
  try {
    const response = await axios.put(
      API_ENDPOINTS.CALENDAR_ENTRY(entryId),
      entryData,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating calendar entry:', error);
    throw error;
  }
};

/**
 * Delete a calendar entry
 */
export const deleteCalendarEntry = async (entryId) => {
  try {
    const response = await axios.delete(API_ENDPOINTS.CALENDAR_ENTRY(entryId), {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting calendar entry:', error);
    throw error;
  }
};
