import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, X, Plus } from "lucide-react";
import Header from "@/components/layout/Header";
// Using direct fetch for this page per rollback
import SEO from "@/components/seo/SEO";
import { acceptAppointment, declineAppointment } from "@/utils/appointmentTracker";

// Services are loaded from backend by selected gender

export default function Booking() {
  const [selectedGender, setSelectedGender] = useState<string>('gender');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [serviceDropdowns, setServiceDropdowns] = useState([{ id: 'dropdown-1', value: '' }]);
  // Track selected day as a string matching backend expectations: 'Anyday' | 'Monday' | ... | 'Friday'
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  // Reverted: no specific start time required; backend proposes a time
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const { toast } = useToast();

  const isValidGender = (g: string) => ['male', 'female'].includes(g?.toLowerCase?.() || '');

  // Function to fetch services by gender (backend)
  const fetchServicesByGender = async (gender: string) => {
    if (!isValidGender(gender)) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/services/${gender}`);
      const data = await response.json();
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || `Failed to load services for ${gender}`);
      }
      const filteredServices = Array.isArray(data.services)
        ? data.services.filter((s: any) => (s?.gender || '').toLowerCase() === gender.toLowerCase())
        : [];
      setServices(filteredServices);
      toast({ title: "Services Loaded", description: `Found ${filteredServices.length} services for ${gender}` });
    } catch (error) {
      console.error('Error fetching services by gender:', error);
      toast({
        title: "Error",
        description: "Failed to load services. Please try again.",
        variant: "destructive",
      });
      setServices([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenderChange = (value: string) => {
    setSelectedGender(value);
    // Reset all service selections when gender changes
    setSelectedServices([]);
    setServiceDropdowns([{ id: 'dropdown-1', value: '' }]);
    
    // Fetch services for the selected gender
    if (isValidGender(value)) {
      fetchServicesByGender(value);
    } else {
      setServices([]);
    }
  };

  const handleDayChange = (value: string) => {
    setSelectedDay(value);
  };

  const handleTimeChange = (value: string) => {
    setSelectedTime(value);
    // no-op
  };

  const handleServiceChange = (dropdownId: string, serviceId: string) => {
    // Update the dropdown value
    setServiceDropdowns(prev => 
      prev.map(dropdown => 
        dropdown.id === dropdownId 
          ? { ...dropdown, value: serviceId }
          : dropdown
      )
    );

    // Add to selected services if not already selected
    const service = services.find(s => s._id === serviceId);
    if (service && !selectedServices.some(ss => ss === serviceId)) {
      setSelectedServices(prev => [...prev, serviceId]);
    }
  };

  const addServiceDropdown = () => {
    const newDropdownId = `dropdown-${Date.now()}`;
    setServiceDropdowns(prev => [...prev, { id: newDropdownId, value: '' }]);
  };

  const removeService = (serviceId: string) => {
    setSelectedServices(prev => prev.filter(ss => ss !== serviceId));
    // Also remove from dropdowns
    setServiceDropdowns(prev => 
      prev.map(dropdown => 
        dropdown.value === serviceId 
          ? { ...dropdown, value: '' }
          : dropdown
      )
    );
  };

  const [bookingResponse, setBookingResponse] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [isProcessingAction, setIsProcessingAction] = useState(false);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !isValidGender(selectedGender) || !selectedDay || !selectedTime || selectedServices.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and select at least one service.",
        variant: "destructive",
      });
      return;
    }

    setIsBooking(true);

    // Prepare booking data
    const bookingData = {
      fullName: customerName,
      phoneNumber: customerPhone,
      gender: selectedGender,
      preferredDay: selectedDay,
      preferredTime: selectedTime,
      services: selectedServices,
    };

    try {
      const token = localStorage.getItem('token');
      console.log('🔍 Booking attempt - Token check:', {
        tokenExists: !!token,
        tokenLength: token?.length || 0,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'No token'
      });

      if (!token) {
        console.log('❌ No token found in localStorage');
        toast({ title: 'Not logged in', description: 'Please log in to book an appointment.', variant: 'destructive' });
        return;
      }

      toast({
        title: "🔍 Searching for availability...",
        description: "Please wait while we find the best slot for you.",
      });

      const response = await fetch('http://localhost:3001/api/book-appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(bookingData),
      });
      const data = await response.json();

      if (data && data.success) {
        setBookingResponse(data);
        setShowModal(true);
        toast({
          title: "🎉 Slot Found!",
          description: "We found an available slot for you. Please review the details.",
        });
        // Reset form
        setCustomerName('');
        setCustomerPhone('');
        setSelectedGender('gender');
        setSelectedDay('');
        setSelectedTime('');
        setSelectedServices([]);
        setServiceDropdowns([{ id: 'dropdown-1', value: '' }]);
        setServices([]);
      } else {
        toast({
          title: "😔 No Availability",
          description: (data && (data.message || data.error)) || 'No suitable slot available. Please try different preferences.',
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "❌ Booking Failed",
        description: error.message || 'Could not book appointment. Please try again.',
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };

  const handleAcceptAppointment = async () => {
    if (!bookingResponse?.links?.accept) return;

    setIsProcessingAction(true);
    try {
      // Use the utility function to handle the accept action with authentication
      const result = await acceptAppointment(bookingResponse.links.accept, bookingResponse);

      if (result.success) {
        toast({
          title: "✅ Appointment Confirmed!",
          description: "Your appointment has been successfully booked. Check the Status page for details.",
        });
      } else {
        toast({
          title: "❌ Booking Failed",
          description: result.response?.error || result.response?.message || "Failed to confirm appointment.",
          variant: "destructive",
        });
      }
      setShowModal(false);
      setBookingResponse(null);
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to process appointment confirmation.",
        variant: "destructive",
      });
      setShowModal(false);
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleDeclineAppointment = async () => {
    if (!bookingResponse?.links?.decline) return;

    setIsProcessingAction(true);
    try {
      // Use the utility function to handle the decline action with authentication
      const result = await declineAppointment(bookingResponse.links.decline, bookingResponse);

      if (result.success) {
        toast({
          title: "❌ Appointment Declined",
          description: "The appointment slot has been released. Check Status page for details.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "❌ Error",
          description: result.response?.error || result.response?.message || "Failed to decline appointment.",
          variant: "destructive",
        });
      }
      setShowModal(false);
      setBookingResponse(null);
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to process appointment decline.",
        variant: "destructive",
      });
      setShowModal(false);
    } finally {
      setIsProcessingAction(false);
    }
  };

  const getAvailableServices = (currentDropdownId: string) => {
    // Get services that are not selected in other dropdowns
    const selectedServiceIds = serviceDropdowns
      .filter(dropdown => dropdown.id !== currentDropdownId && dropdown.value)
      .map(dropdown => dropdown.value);
    
    return services.filter(service => !selectedServiceIds.includes(service._id));
  };

  const weekDays = [
    { value: 'Anyday', label: 'Anyday' },
    { value: 'Monday', label: 'Monday' },
    { value: 'Tuesday', label: 'Tuesday' },
    { value: 'Wednesday', label: 'Wednesday' },
    { value: 'Thursday', label: 'Thursday' },
    { value: 'Friday', label: 'Friday' }
  ];

  const timeOptions = [
    { value: 'anytime', label: 'Any time' },
    { value: 'morning', label: '9:00 AM - 12:00 PM' },
    { value: 'afternoon', label: '12:00 PM - 1:30 PM' },
    { value: 'evening', label: '2:30 PM - 6:00 PM' }
  ];

  // removed getTimeBounds (no longer used)

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      <SEO
        title="Book Appointment | Barber Suite"
        description="Book your appointment with our professional barbers."
      />
      <Header />
      <main className="container py-16 relative">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-[url('/images/barber-pattern.png')] opacity-5"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-2xl mx-auto relative">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl mb-4">
              <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">Book Your</span>
              <span className="text-white"> Appointment</span>
            </h1>
            <p className="text-lg text-gray-300">
              Select your preferred services and schedule your visit with our expert barbers.
            </p>
          </div>

                {/* Booking Response Modal */}
          {showModal && bookingResponse && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4 backdrop-blur-sm">
              <Card className="w-full max-w-md bg-gray-900 border border-amber-500/30 shadow-xl shadow-amber-500/10 text-white">
                <CardHeader className="border-b border-gray-800">
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-amber-500 flex items-center justify-center">
                        <span className="text-black text-xs font-bold">✓</span>
                      </div>
                      <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">Booking Response</span>
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowModal(false)}
                      className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-gray-800"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 pt-5">
                  <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                    <p className="text-sm text-amber-300">{bookingResponse.message}</p>
                  </div>

                  {bookingResponse.appointment && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg flex items-center gap-2 text-amber-400">
                        <span className="h-5 w-5 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-xs">📅</span>
                        Appointment Details
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                        <div>
                          <Label className="text-gray-400 mb-1 block">Day</Label>
                          <p className="font-medium text-white">{bookingResponse.appointment.day}</p>
                        </div>
                        <div>
                          <Label className="text-gray-400 mb-1 block">Time Slot</Label>
                          <p className="font-medium text-white capitalize">{bookingResponse.appointment.timeSlot}</p>
                        </div>
                        <div>
                          <Label className="text-gray-400 mb-1 block">Start Time</Label>
                          <p className="font-medium text-white">{new Date(bookingResponse.appointment.startTime).toLocaleTimeString()}</p>
                        </div>
                        <div>
                          <Label className="text-gray-400 mb-1 block">End Time</Label>
                          <p className="font-medium text-white">{new Date(bookingResponse.appointment.endTime).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {bookingResponse.links && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg flex items-center gap-2 text-amber-400">
                        <span className="h-5 w-5 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-xs">⚡</span>
                        Quick Actions
                      </h3>
                      <div className="flex flex-col gap-3">
                        <Button
                          onClick={handleAcceptAppointment}
                          disabled={isProcessingAction}
                          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black font-medium hover:from-amber-600 hover:to-amber-700 shadow-lg shadow-amber-500/20"
                        >
                          {isProcessingAction ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Confirming...
                            </>
                          ) : (
                            "Accept & Confirm Booking"
                          )}
                        </Button>
                        <Button
                          onClick={handleDeclineAppointment}
                          disabled={isProcessingAction}
                          variant="outline"
                          className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                        >
                          {isProcessingAction ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            "Decline Booking"
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="pt-3 border-t border-gray-800">
                    <Button
                      variant="ghost"
                      className="w-full text-gray-300 hover:text-white hover:bg-gray-800"
                      onClick={() => setShowModal(false)}
                    >
                      Close
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <Card className="bg-gray-900 border border-amber-500/20 shadow-lg text-white">
            <CardHeader className="border-b border-gray-800">
              <CardTitle className="text-xl text-amber-400">Appointment Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Customer Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-300">Full Name *</Label>
                    <Input
                      id="name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter your full name"
                      className="bg-gray-800 border-gray-700 text-white focus:border-amber-500/50 focus:ring-amber-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-300">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Enter your phone number"
                      className="bg-gray-800 border-gray-700 text-white focus:border-amber-500/50 focus:ring-amber-500/20"
                    />
                  </div>
                </div>

                {/* Gender Selection */}
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-gray-300">Gender *</Label>
                  <Select value={selectedGender} onValueChange={handleGenderChange}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white focus:border-amber-500/50 focus:ring-amber-500/20">
                      <SelectValue placeholder="Select your gender" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      <SelectItem value="gender" className="text-gray-400">Gender</SelectItem>
                      <SelectItem value="male" className="text-white">Male</SelectItem>
                      <SelectItem value="female" className="text-white">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Day Selection */}
                <div className="space-y-2">
                  <Label htmlFor="day" className="text-gray-300">Preferred Day *</Label>
                  <Select value={selectedDay} onValueChange={handleDayChange}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white focus:border-amber-500/50 focus:ring-amber-500/20">
                      <SelectValue placeholder="Select your preferred day" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      {weekDays.map((day) => (
                        <SelectItem key={day.value} value={day.value} className="text-white">
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Time Selection */}
                <div className="space-y-2">
                  <Label htmlFor="time" className="text-gray-300">Preferred Time *</Label>
                  <Select value={selectedTime} onValueChange={handleTimeChange}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white focus:border-amber-500/50 focus:ring-amber-500/20">
                      <SelectValue placeholder="Select your preferred time" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      {timeOptions.map((time) => (
                        <SelectItem key={time.value} value={time.value} className="text-white">
                          {time.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Preferred Start Time removed; backend proposes time and returns links */}

                {/* Service Selection */}
                <div className="space-y-4">
                  <Label className="text-gray-300">Select Services *</Label>
                  {!isValidGender(selectedGender) ? (
                    <div className="p-5 border border-gray-700 rounded-lg bg-gray-800/50">
                      <p className="text-sm text-gray-400">
                        Please select your gender first to view available services.
                      </p>
                    </div>
                  ) : isLoading ? (
                    <div className="flex items-center gap-3 p-5 border border-gray-700 rounded-lg bg-gray-800/50">
                      <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
                      <span className="text-gray-300">Loading services for {selectedGender}...</span>
                    </div>
                  ) : services.length === 0 ? (
                    <div className="p-5 border border-gray-700 rounded-lg bg-gray-800/50">
                      <p className="text-sm text-gray-400">
                        No services available for {selectedGender}. Please try another gender.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {serviceDropdowns.map((dropdown, index) => {
                        const availableServices = getAvailableServices(dropdown.id);
                        const selectedService = services.find(s => s._id === dropdown.value);
                        
                        return (
                          <div key={dropdown.id} className="flex items-center gap-3">
                            <div className="flex-1">
                              <Select
                                value={dropdown.value}
                                onValueChange={(value) => handleServiceChange(dropdown.id, value)}
                              >
                                <SelectTrigger className="bg-gray-800 border-gray-700 text-white focus:border-amber-500/50 focus:ring-amber-500/20">
                                  <SelectValue placeholder={`Select service ${index + 1}`} />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                                  {availableServices.length === 0 ? (
                                    <SelectItem value="no-services" disabled className="text-gray-500">
                                      No more services available for {selectedGender}
                                    </SelectItem>
                                  ) : (
                                    availableServices.map((service) => (
                                      <SelectItem key={service._id} value={service._id} className="text-white">
                                        {service.name} - {service.cost} ({service.time})
                                      </SelectItem>
                                    ))
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                            {selectedService && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeService(selectedService._id)}
                                className="text-gray-400 hover:text-white hover:bg-gray-800"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        );
                      })}
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addServiceDropdown}
                        className="w-full border-gray-700 text-amber-400 hover:bg-gray-800 hover:text-amber-300 hover:border-amber-500/30"
                        disabled={serviceDropdowns.every(dropdown => dropdown.value === '')}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Another Service
                      </Button>
                    </div>
                  )}
                </div>

                {/* Selected Services Summary */}
                {selectedServices.length > 0 && (
                  <div className="space-y-4">
                    <Label className="text-gray-300">Selected Services:</Label>
                    <div className="space-y-3">
                      {selectedServices.map((selectedService) => (
                        <div key={selectedService} className="flex items-center justify-between p-4 bg-gray-800/70 border border-gray-700 hover:border-amber-500/30 rounded-lg transition-colors">
                          <div>
                            <p className="font-medium text-white">{services.find(s => s._id === selectedService)?.name}</p>
                            <p className="text-sm text-gray-400">
                              <span className="text-amber-500">{services.find(s => s._id === selectedService)?.cost}</span> • {services.find(s => s._id === selectedService)?.time}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeService(selectedService)}
                            className="text-gray-400 hover:text-white hover:bg-gray-800"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full mt-8 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-medium shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all hover:from-amber-600 hover:to-amber-700"
                  size="lg"
                  disabled={isBooking}
                >
                  {isBooking ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Searching for slots...
                    </>
                  ) : (
                    "Book Your Appointment"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}; 