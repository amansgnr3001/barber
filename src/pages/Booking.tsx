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
      if (!token) {
        toast({ title: 'Not logged in', description: 'Please log in to book an appointment.', variant: 'destructive' });
        return;
      }
      const response = await fetch('http://localhost:3001/api/book-appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(bookingData),
      });
      const data = await response.json();
      if (response.ok) {
        setBookingResponse(data);
        setShowModal(true);
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
          title: "Booking Failed",
          description: data.error || data.message || 'Could not book appointment.',
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Booking Failed",
        description: error.message || 'Could not book appointment.',
        variant: "destructive",
      });
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
    { value: 'morning', label: '9:00 AM - 10:00 AM' },
    { value: 'afternoon', label: '12:00 PM - 1:00 PM' },
    { value: 'evening', label: '2:30 PM - 3:30 PM' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Book Appointment | Barber Suite"
        description="Book your appointment with our professional barbers."
      />
      <Header />
      <main className="container py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl mb-4">
              Book Your Appointment
            </h1>
            <p className="text-lg text-muted-foreground">
              Choose your services and provide your contact information.
            </p>
          </div>

          {/* Booking Response Modal */}
          {showModal && bookingResponse && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
                <h2 className="text-2xl font-bold mb-4">Booking Details</h2>
                <p className="mb-2"><strong>Message:</strong> {bookingResponse.message}</p>
                {bookingResponse.appointmentTime && (
                  <p className="mb-2"><strong>Appointment Time:</strong> {new Date(bookingResponse.appointmentTime).toLocaleString()}</p>
                )}
                {bookingResponse.day && (
                  <p className="mb-2"><strong>Day:</strong> {bookingResponse.day}</p>
                )}
                {bookingResponse.slot && (
                  <p className="mb-2"><strong>Slot:</strong> {bookingResponse.slot}</p>
                )}
                {bookingResponse.links && (
                  <div className="mb-2">
                    <strong>Links:</strong>
                    <div className="flex flex-col gap-2 mt-1">
                      <a href={bookingResponse.links.accept} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Accept Booking</a>
                      <a href={bookingResponse.links.decline} className="text-red-600 underline" target="_blank" rel="noopener noreferrer">Decline Booking</a>
                    </div>
                  </div>
                )}
                <button className="mt-4 px-4 py-2 bg-gray-800 text-white rounded" onClick={() => setShowModal(false)}>Close</button>
              </div>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Appointment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Customer Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                {/* Gender Selection */}
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select value={selectedGender} onValueChange={handleGenderChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gender">Gender</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Day Selection */}
                <div className="space-y-2">
                  <Label htmlFor="day">Preferred Day *</Label>
                  <Select value={selectedDay} onValueChange={handleDayChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your preferred day" />
                    </SelectTrigger>
                    <SelectContent>
                      {weekDays.map((day) => (
                        <SelectItem key={day.value} value={day.value}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Time Selection */}
                <div className="space-y-2">
                  <Label htmlFor="time">Preferred Time *</Label>
                  <Select value={selectedTime} onValueChange={handleTimeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your preferred time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map((time) => (
                        <SelectItem key={time.value} value={time.value}>
                          {time.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Service Selection */}
                <div className="space-y-4">
                  <Label>Select Services *</Label>
                  {!isValidGender(selectedGender) ? (
                    <div className="p-4 border rounded-lg bg-muted">
                      <p className="text-sm text-muted-foreground">
                        Please select your gender first to view available services.
                      </p>
                    </div>
                  ) : isLoading ? (
                    <div className="flex items-center gap-2 p-4 border rounded-lg">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading services for {selectedGender}...
                    </div>
                  ) : services.length === 0 ? (
                    <div className="p-4 border rounded-lg bg-muted">
                      <p className="text-sm text-muted-foreground">
                        No services available for {selectedGender}. Please try another gender.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
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
                                <SelectTrigger>
                                  <SelectValue placeholder={`Select service ${index + 1}`} />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableServices.length === 0 ? (
                                    <SelectItem value="no-services" disabled>
                                      No more services available for {selectedGender}
                                    </SelectItem>
                                  ) : (
                                    availableServices.map((service) => (
                                      <SelectItem key={service._id} value={service._id}>
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
                        className="w-full"
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
                  <div className="space-y-3">
                    <Label>Selected Services:</Label>
                    <div className="space-y-2">
                      {selectedServices.map((selectedService) => (
                        <div key={selectedService} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div>
                            <p className="font-medium">{services.find(s => s._id === selectedService)?.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {services.find(s => s._id === selectedService)?.cost} • {services.find(s => s._id === selectedService)?.time}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeService(selectedService)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full" size="lg">
                  Book Appointment
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}; 