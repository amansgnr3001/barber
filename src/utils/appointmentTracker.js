export const acceptAppointment = async (url, originalBooking) => {
  return processAppointmentAction(url, 'ACCEPT', originalBooking);
};

export const declineAppointment = async (url, originalBooking) => {
  return processAppointmentAction(url, 'DECLINE', originalBooking);
};

export const cancelAppointment = async (appointmentId) => {
  try {
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

    console.log(`🔍 Cancelling appointment with ID ${appointmentId}`);
    console.log(`🔑 Using ${customerToken ? 'customer' : 'barber'} token:`, token.substring(0, 15) + '...');

    const response = await fetch(`http://localhost:3001/api/appointments/${appointmentId}/cancel`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error('Failed to parse JSON response:', jsonError);
      return { success: false, error: 'Invalid response format from server', httpStatus: response.status, action: 'CANCEL', timestamp: new Date().toISOString() };
    }

    const responseData = {
      action: 'CANCEL',
      timestamp: new Date().toISOString(),
      response: data,
      httpStatus: response.status,
      success: response.ok && data.success
    };
    localStorage.setItem('lastCancelResponse', JSON.stringify(responseData));
    return responseData;

  } catch (error) {
    console.error(`Error cancelling appointment:`, error);
    const errorData = {
      action: 'CANCEL',
      timestamp: new Date().toISOString(),
      error: true,
      success: false,
      response: { success: false, error: error.message || 'Failed to cancel appointment' }
    };
    localStorage.setItem('lastCancelResponse', JSON.stringify(errorData));
    return errorData;
  }
};

export const processAppointmentAction = async (url, action, originalBooking) => {
  try {
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

    const urlObj = new URL(url);
    const queryParams = urlObj.search;
    const baseUrl = urlObj.origin + urlObj.pathname;

    const response = await fetch(`${baseUrl}${queryParams}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();

    const responseData = {
      action,
      timestamp: new Date().toISOString(),
      response: data,
      originalBooking,
      httpStatus: response.status,
      success: data.success
    };

    localStorage.setItem('lastAppointmentResponse', JSON.stringify(responseData));
    return responseData;

  } catch (error) {
    console.error(`Error processing ${action} appointment:`, error);
    const errorData = {
      action,
      timestamp: new Date().toISOString(),
      error: true,
      success: false,
      response: { success: false, error: error.message || `Failed to process appointment ${action.toLowerCase()}` },
      originalBooking
    };
    localStorage.setItem('lastAppointmentResponse', JSON.stringify(errorData));
    return errorData;
  }
};

// Fetch services with authentication
export const fetchAuthenticatedServices = async () => {
  try {
    const customerToken = localStorage.getItem('token');
    const barberToken = localStorage.getItem('barberToken');
    const token = customerToken || barberToken;

    if (!token) {
      console.error('No authentication token found');
      return {
        success: false,
        error: 'Authentication token not found. Please log in again.',
        action: 'FETCH_SERVICES',
        timestamp: new Date().toISOString()
      };
    }

    console.log(`🔍 Fetching services with ${customerToken ? 'customer' : 'barber'} token`);

    const response = await fetch('http://localhost:3001/api/services', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error('Failed to parse JSON response:', jsonError);
      return { 
        success: false, 
        error: 'Invalid response format from server', 
        action: 'FETCH_SERVICES', 
        timestamp: new Date().toISOString() 
      };
    }

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to fetch services',
        action: 'FETCH_SERVICES',
        timestamp: new Date().toISOString()
      };
    }

    return {
      success: true,
      services: data,
      action: 'FETCH_SERVICES',
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error(`Error fetching services:`, error);
    return {
      success: false,
      error: error.message || 'Failed to fetch services',
      action: 'FETCH_SERVICES',
      timestamp: new Date().toISOString()
    };
  }
};

// Now define deleteAllAppointments after the above function
export const deleteAllAppointments = async (appointmentId) => {
  try {
    const barberToken = localStorage.getItem('barberToken');
    if (!barberToken) {
      console.error('No barber authentication token found');
      return { success: false, error: 'Barber authentication token not found. Please log in again.', action: 'DELETE_ALL', timestamp: new Date().toISOString() };
    }
    console.log(`🔍 Deleting all appointments with ID ${appointmentId}`);
    const response = await fetch(`http://localhost:3001/api/appointments/delete-all/${appointmentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${barberToken}`,
        'Content-Type': 'application/json'
      }
    });

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error('Failed to parse JSON response:', jsonError);
      return { success: false, error: 'Invalid response format from server', httpStatus: response.status, action: 'DELETE_ALL', timestamp: new Date().toISOString() };
    }

    const responseData = {
      action: 'DELETE_ALL',
      timestamp: new Date().toISOString(),
      response: data,
      httpStatus: response.status,
      success: response.ok && data.success,
      deletedCount: data.deletedCount || 0
    };
    localStorage.setItem('lastDeleteAllResponse', JSON.stringify(responseData));
    return responseData;

  } catch (error) {
    console.error(`Error deleting all appointments:`, error);
    const errorData = {
      action: 'DELETE_ALL',
      timestamp: new Date().toISOString(),
      error: true,
      success: false,
      response: { success: false, error: error.message || 'Failed to delete all appointments' }
    };
    localStorage.setItem('lastDeleteAllResponse', JSON.stringify(errorData));
    return errorData;
  }
};
