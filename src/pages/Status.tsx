import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Clock, User, Phone, AlertCircle, CheckCircle } from "lucide-react";
import Header from "@/components/layout/Header";
import SEO from "@/components/seo/SEO";

interface ResponseData {
  action: string;
  timestamp: string;
  response: any;
  originalBooking: any;
  httpStatus?: number;
  error?: boolean;
}

export default function Status() {
  const { toast } = useToast();
  const [responseData, setResponseData] = useState<ResponseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    // Load response data from localStorage
    const loadResponseData = () => {
      try {
        const storedData = localStorage.getItem('lastAppointmentResponse');
        if (storedData) {
          const data = JSON.parse(storedData);
          setResponseData(data);
        }
      } catch (error) {
        console.error('Error loading response data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadResponseData();
  }, []);

  const clearResponseData = () => {
    localStorage.removeItem('lastAppointmentResponse');
    setResponseData(null);
    toast({
      title: "✅ Cleared",
      description: "Response data has been cleared.",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleCancelAppointment = async () => {
    console.log(`\n🎯 ===== CANCEL BUTTON CLICKED =====`);
    console.log(`📅 Timestamp: ${new Date().toLocaleString()}`);
    console.log(`📋 Response data exists: ${!!responseData}`);

    if (!responseData) {
      console.log(`❌ No response data found`);
      toast({
        title: "❌ Error",
        description: "No appointment data found.",
        variant: "destructive",
      });
      return;
    }

    // Get appointment ID from multiple possible locations
    const appointmentId = responseData?.response?.appointment?.id ||
                         responseData?.response?.appointment?._id;

    console.log(`🔍 Searching for appointment ID...`);
    console.log(`   - responseData.response.appointment.id: ${responseData?.response?.appointment?.id}`);
    console.log(`   - responseData.response.appointment._id: ${responseData?.response?.appointment?._id}`);
    console.log(`🆔 Final appointment ID: ${appointmentId}`);

    if (!appointmentId) {
      console.log(`❌ No appointment ID found in any location`);
      toast({
        title: "❌ Error",
        description: "Cannot find appointment ID. Please book a new appointment.",
        variant: "destructive",
      });
      return;
    }

    console.log(`🚀 Starting cancellation process for ID: ${appointmentId}`);
    setIsCancelling(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "❌ Authentication Error",
          description: "Please log in again to cancel appointment.",
          variant: "destructive",
        });
        setIsCancelling(false);
        return;
      }

      console.log(`🌐 Making API request to cancel appointment...`);
      console.log(`📡 URL: http://localhost:3001/api/appointments/cancel/${appointmentId}`);
      console.log(`🔑 Token present: ${!!token}`);
      console.log(`📤 Request method: DELETE`);

      const response = await fetch(`http://localhost:3001/api/appointments/cancel/${appointmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`📥 API Response received:`);
      console.log(`   - Status: ${response.status}`);
      console.log(`   - Status Text: ${response.statusText}`);
      console.log(`   - OK: ${response.ok}`);

      let data;
      try {
        data = await response.json();
        console.log('📋 Cancel API response:', data);
      } catch (jsonError) {
        console.error('❌ Failed to parse JSON response:', jsonError);
        const textResponse = await response.text();
        console.log('📋 Raw response:', textResponse);

        toast({
          title: "❌ Server Error",
          description: `Server returned invalid response. Status: ${response.status}`,
          variant: "destructive",
        });
        return;
      }

      if (response.ok && data.success) {
        toast({
          title: "✅ Appointment Cancelled",
          description: data.message || "Your appointment has been successfully cancelled.",
        });

        // Clear the stored response data since appointment is cancelled
        localStorage.removeItem('lastAppointmentResponse');
        setResponseData(null);

      } else {
        toast({
          title: "❌ Cancellation Failed",
          description: data.error || data.message || "Failed to cancel appointment. Please try again.",
          variant: "destructive",
        });
      }

    } catch (error: any) {
      console.error('❌ Error cancelling appointment:', error);
      toast({
        title: "❌ Network Error",
        description: "Could not connect to server. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
    }
  };



  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <SEO title="Appointment Status | Barber Suite" description="Check your appointment status" />
        <Header />
        <main className="container py-16">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading status...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Appointment Status | Barber Suite" description="Check your appointment status" />
      <Header />
      <main className="container py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl mb-2">
                📋 Appointment Status
              </h1>
              <p className="text-lg text-muted-foreground">
                View your confirmed appointment details
              </p>
            </div>
            {responseData && (
              <Button
                onClick={clearResponseData}
                variant="outline"
              >
                🗑️ Clear Data
              </Button>
            )}
          </div>

          {!responseData ? (
            <Card>
              <CardContent className="text-center py-16">
                <AlertCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Appointment Details</h3>
                <p className="text-muted-foreground mb-4">
                  No appointment found. Make a booking and accept it to see appointment details here.
                </p>
                <Button onClick={() => window.location.href = '/booking'}>
                  📅 Go to Booking
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Appointment Details */}
              {responseData.response?.appointment && responseData.action === 'ACCEPT' && !responseData.error ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Appointment Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Customer Name</p>
                          <p className="font-medium text-lg">{responseData.response.appointment.customerName}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Phone Number</p>
                          <p className="font-medium text-lg">{responseData.response.appointment.customerPhone || 'Not provided'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Gender</p>
                          <p className="font-medium text-lg capitalize">{responseData.response.appointment.gender || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Appointment Day</p>
                          <p className="font-medium text-lg">{responseData.response.appointment.day}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Time Slot</p>
                          <p className="font-medium text-lg capitalize">{responseData.response.appointment.timeSlot}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Status</p>
                          <Badge className="bg-green-100 text-green-800 text-sm px-3 py-1">
                            ✅ {responseData.response.appointment.status}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {(responseData.response.appointment.startTime || responseData.response.appointment.endTime) && (
                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                        {responseData.response.appointment.startTime && (
                          <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">Start Time</p>
                              <p className="font-medium text-lg">{formatDateTime(responseData.response.appointment.startTime)}</p>
                            </div>
                          </div>
                        )}
                        {responseData.response.appointment.endTime && (
                          <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">End Time</p>
                              <p className="font-medium text-lg">{formatDateTime(responseData.response.appointment.endTime)}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {(responseData.response.appointment.id || responseData.response.appointment._id) && (
                      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-muted-foreground">Booking ID:</span>
                          <span className="font-mono bg-white px-3 py-1 rounded border text-sm">
                            {(responseData.response.appointment.id || responseData.response.appointment._id).toString().slice(-8)}
                          </span>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          Full ID: {responseData.response.appointment.id || responseData.response.appointment._id}
                        </div>
                      </div>
                    )}

                    {/* Cancel Button */}
                    <div className="pt-6 border-t">
                      <Button
                        onClick={handleCancelAppointment}
                        disabled={isCancelling}
                        variant="destructive"
                        size="lg"
                        className="w-full md:w-auto"
                      >
                        {isCancelling ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Cancelling...
                          </>
                        ) : (
                          "❌ Cancel Appointment"
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="text-center py-16">
                    <AlertCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">No Confirmed Appointment</h3>
                    <p className="text-muted-foreground mb-4">
                      {responseData.action === 'DECLINE'
                        ? 'You declined this appointment. The slot has been released.'
                        : responseData.error
                          ? 'There was an error with your appointment request.'
                          : 'No confirmed appointment found.'
                      }
                    </p>
                    <Button onClick={() => window.location.href = '/booking'}>
                      📅 Book New Appointment
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
