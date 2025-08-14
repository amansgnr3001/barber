/**
 * Utility functions for handling appointment tracking and actions
 */

/**
 * Makes an authenticated request to an appointment action URL (accept/decline)
 * @param {string} url - The appointment action URL
 * @param {string} action - The action being performed ('ACCEPT' or 'DECLINE')
 * @param {Object} originalBooking - The original booking response data
 * @returns {Promise<Object>} - The response data and metadata
 */
export const processAppointmentAction = async (url, action, originalBooking) => {
  try {
    // Get the appropriate token based on user type
    const token = localStorage.getItem('token') || localStorage.getItem('barberToken');
    
    if (!token) {
      console.error('No authentication token found');
      return {
        success: false,
        error: 'Authentication token not found. Please log in again.',
        action,
        timestamp: new Date().toISOString(),
        originalBooking
      };
    }
    
    console.log(`🔍 Processing ${action} appointment with token:`, token.substring(0, 15) + '...');
    
    // Extract the base URL and query parameters
    const urlObj = new URL(url);
    const queryParams = urlObj.search;
    
    // Reconstruct the URL without the query parameters
    const baseUrl = urlObj.origin + urlObj.pathname;
    
    // Make the authenticated request
    const response = await fetch(`${baseUrl}${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    // Create response data object
    const responseData = {
      action,
      timestamp: new Date().toISOString(),
      response: data,
      originalBooking,
      httpStatus: response.status,
      success: data.success
    };
    
    // Store in localStorage for Status page
    localStorage.setItem('lastAppointmentResponse', JSON.stringify(responseData));
    
    return responseData;
  } catch (error) {
    console.error(`Error processing ${action} appointment:`, error);
    
    // Create error response
    const errorData = {
      action,
      timestamp: new Date().toISOString(),
      error: true,
      success: false,
      response: {
        success: false,
        error: error.message || `Failed to process appointment ${action.toLowerCase()}`
      },
      originalBooking
    };
    
    // Store error in localStorage
    localStorage.setItem('lastAppointmentResponse', JSON.stringify(errorData));
    
    return errorData;
  }
};

/**
 * Accept an appointment with proper authentication
 * @param {string} acceptUrl - The accept URL from booking response
 * @param {Object} originalBooking - The original booking response data
 * @returns {Promise<Object>} - The response data
 */
export const acceptAppointment = async (acceptUrl, originalBooking) => {
  return processAppointmentAction(acceptUrl, 'ACCEPT', originalBooking);
};

/**
 * Decline an appointment with proper authentication
 * @param {string} declineUrl - The decline URL from booking response
 * @param {Object} originalBooking - The original booking response data
 * @returns {Promise<Object>} - The response data
 */
export const declineAppointment = async (declineUrl, originalBooking) => {
  return processAppointmentAction(declineUrl, 'DECLINE', originalBooking);
};
