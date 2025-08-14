/**
 * Utility functions for handling appointment tracking, actions, and service management
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
    const customerToken = localStorage.getItem('token');
    const barberToken = localStorage.getItem('barberToken');
    const token = customerToken || barberToken;
    
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
    
    console.log(`🔍 Processing ${action} appointment with ${customerToken ? 'customer' : 'barber'} token:`, token.substring(0, 15) + '...');
    
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

/**
 * Fetch services with proper authentication for barber dashboard
 * @returns {Promise<Object>} - The response data with services
 */
export const fetchAuthenticatedServices = async () => {
  try {
    // Get the barber token for authentication
    const token = localStorage.getItem('barberToken');
    
    if (!token) {
      console.error('No barber authentication token found');
      return {
        success: false,
        error: 'Authentication token not found. Please log in again.',
        services: []
      };
    }
    
    console.log('🔍 Fetching services with barber authentication');
    
    // Make the authenticated request to the services endpoint
    const response = await fetch('http://localhost:3001/api/services', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch services:', response.status, errorText);
      return {
        success: false,
        error: `Failed to fetch services: ${response.status} - ${errorText || 'Unknown error'}`,
        services: []
      };
    }
    
    const data = await response.json();
    return {
      success: true,
      services: data
    };
  } catch (error) {
    console.error('Error fetching services:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch services',
      services: []
    };
  }
};

/**
 * Cancel an appointment with proper authentication
 * @param {string} appointmentId - The ID of the appointment to cancel
 * @returns {Promise<Object>} - The response data
 */
export const cancelAppointment = async (appointmentId) => {
  try {
    // Try to get either customer or barber token for authentication
    const customerToken = localStorage.getItem('token');
    const barberToken = localStorage.getItem('barberToken');
    const token = customerToken || barberToken;
    
    if (!token) {
      console.error('No authentication token found');
      return {
        success: false,
        error: 'Authentication token not found. Please log in again.',
        action: 'CANCEL',
        timestamp: new Date().toISOString()
      };
    }
    
    console.log(`🔍 Using ${customerToken ? 'customer' : 'barber'} token for cancellation`);
    
    console.log(`🔍 Cancelling appointment ${appointmentId} with token:`, token.substring(0, 15) + '...');
    
    // Make the authenticated request to the cancel endpoint
    const response = await fetch(`http://localhost:3001/api/appointments/${appointmentId}/cancel`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Try to parse the response as JSON
    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error('Failed to parse JSON response:', jsonError);
      // Return a structured error response instead of throwing
      return {
        success: false,
        error: 'Invalid response format from server',
        httpStatus: response.status,
        action: 'CANCEL',
        timestamp: new Date().toISOString()
      };
    }
    
    // Create response data object
    const responseData = {
      action: 'CANCEL',
      timestamp: new Date().toISOString(),
      response: data,
      httpStatus: response.status,
      success: response.ok && data.success
    };
    
    // Store in localStorage for reference
    localStorage.setItem('lastCancelResponse', JSON.stringify(responseData));
    
    return responseData;
  } catch (error) {
    console.error(`Error cancelling appointment:`, error);
    
    // Create error response
    const errorData = {
      action: 'CANCEL',
      timestamp: new Date().toISOString(),
      error: true,
      success: false,
      response: {
        success: false,
        error: error.message || 'Failed to cancel appointment'
      }
    };
    
    // Store error in localStorage
    localStorage.setItem('lastCancelResponse', JSON.stringify(errorData));
    
    return errorData;
  }
};
