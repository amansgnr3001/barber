// Utility to track new appointments for dashboard updates

export const addNewAppointment = (appointmentData) => {
  const recentBookings = JSON.parse(localStorage.getItem('recentBookings') || '[]');
  
  const newAppointment = {
    _id: appointmentData.id || `new_${Date.now()}`,
    customerName: appointmentData.customerName,
    customerPhone: appointmentData.customerPhone,
    day: appointmentData.day,
    timeSlot: appointmentData.timeSlot,
    startTime: appointmentData.startTime,
    endTime: appointmentData.endTime,
    status: 'booked',
    gender: appointmentData.gender,
    services: appointmentData.services || 'Haircut',
    createdAt: new Date().toISOString()
  };
  
  recentBookings.unshift(newAppointment); // Add to beginning
  
  // Keep only last 10 appointments
  if (recentBookings.length > 10) {
    recentBookings.splice(10);
  }
  
  localStorage.setItem('recentBookings', JSON.stringify(recentBookings));
  
  console.log('📝 New appointment tracked:', newAppointment);
  return newAppointment;
};

export const removeAppointment = (appointmentId) => {
  const recentBookings = JSON.parse(localStorage.getItem('recentBookings') || '[]');
  const updatedBookings = recentBookings.filter(apt => apt._id !== appointmentId);
  
  localStorage.setItem('recentBookings', JSON.stringify(updatedBookings));
  
  console.log('❌ Appointment removed from tracking:', appointmentId);
};

export const getRecentAppointments = () => {
  return JSON.parse(localStorage.getItem('recentBookings') || '[]');
};

export const clearAllAppointments = () => {
  localStorage.removeItem('recentBookings');
  console.log('🗑️ All tracked appointments cleared');
};
