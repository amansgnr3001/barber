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
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white relative">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-[url('/images/barber-pattern.png')] opacity-5"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
        
        <SEO title="Appointment Status | Barber Suite" description="Check your appointment status" />
        <Header />
        <main className="container py-16 relative z-10">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 mx-auto mb-6">
                <Loader2 className="h-8 w-8 animate-spin text-black" />
              </div>
              <p className="text-gray-300">Loading your appointment status...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white relative">
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-[url('/images/barber-pattern.png')] opacity-5"></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
      
      <SEO title="Appointment Status | Barber Suite" description="Check your appointment status" />
      <Header />
      <main className="container py-16 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl mb-2">
                <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                  Appointment Status
                </span>
              </h1>
              <p className="text-gray-300">
                View your confirmed appointment details
              </p>
            </div>
            {responseData && (
              <Button
                onClick={clearResponseData}
                variant="outline"
                className="text-gray-300 hover:text-white hover:bg-gray-800/50 border border-amber-500/30 hover:border-amber-500/50 transition-all"
              >
                🗑️ Clear Data
              </Button>
            )}
          </div>

          {!responseData ? (
            <Card className="bg-gray-900 border border-amber-500/20 shadow-xl shadow-amber-500/10 text-white">
              <CardContent className="text-center py-16">
                <div className="h-20 w-20 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-6 border border-amber-500/20">
                  <AlertCircle className="h-10 w-10 text-amber-500/80" />
                </div>
                <h3 className="text-2xl font-semibold mb-3 bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">No Appointment Details</h3>
                <p className="text-gray-300 mb-6 max-w-md mx-auto">
                  No appointment found. Make a booking and accept it to see appointment details here.
                </p>
                <Button
                  onClick={() => window.location.href = '/booking'}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all hover:from-amber-600 hover:to-amber-700"
                >
                  📅 Go to Booking
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Appointment Details */}
              {responseData.response?.appointment && responseData.action === 'ACCEPT' && !responseData.error ? (
                <Card className="bg-gray-900 border border-amber-500/20 shadow-xl shadow-amber-500/10 text-white">
                  <CardHeader className="border-b border-gray-800">
                    <CardTitle className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                        <Calendar className="h-5 w-5 text-black" />
                      </div>
                      <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                        Appointment Details
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center border border-amber-500/20">
                          <User className="h-5 w-5 text-amber-500" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Customer Name</p>
                          <p className="font-medium text-lg text-white">{responseData.response.appointment.customerName}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center border border-amber-500/20">
                          <Phone className="h-5 w-5 text-amber-500" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Phone Number</p>
                          <p className="font-medium text-lg text-white">{responseData.response.appointment.customerPhone || 'Not provided'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center border border-amber-500/20">
                          <User className="h-5 w-5 text-amber-500" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Gender</p>
                          <p className="font-medium text-lg capitalize text-white">{responseData.response.appointment.gender || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center border border-amber-500/20">
                          <Calendar className="h-5 w-5 text-amber-500" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Appointment Day</p>
                          <p className="font-medium text-lg text-white">{responseData.response.appointment.day}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center border border-amber-500/20">
                          <Clock className="h-5 w-5 text-amber-500" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Time Slot</p>
                          <p className="font-medium text-lg capitalize text-white">{responseData.response.appointment.timeSlot}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center border border-amber-500/20">
                          <CheckCircle className="h-5 w-5 text-amber-500" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Status</p>
                          <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-black text-sm px-3 py-1 font-medium">
                            ✅ {responseData.response.appointment.status}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {(responseData.response.appointment.startTime || responseData.response.appointment.endTime) && (
                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                        {responseData.response.appointment.startTime && (
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center border border-amber-500/20">
                              <Clock className="h-5 w-5 text-amber-500" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">Start Time</p>
                              <p className="font-medium text-lg text-white">{formatDateTime(responseData.response.appointment.startTime)}</p>
                            </div>
                          </div>
                        )}
                        {responseData.response.appointment.endTime && (
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center border border-amber-500/20">
                              <Clock className="h-5 w-5 text-amber-500" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">End Time</p>
                              <p className="font-medium text-lg text-white">{formatDateTime(responseData.response.appointment.endTime)}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {(responseData.response.appointment.id || responseData.response.appointment._id) && (
                      <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-amber-500/20">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-amber-400">Booking ID:</span>
                          <span className="font-mono bg-black/30 px-3 py-1 rounded border border-amber-500/30 text-sm text-amber-300">
                            {(responseData.response.appointment.id || responseData.response.appointment._id).toString().slice(-8)}
                          </span>
                        </div>
                        <div className="mt-2 text-xs text-gray-400">
                          Full ID: {responseData.response.appointment.id || responseData.response.appointment._id}
                        </div>
                      </div>
                    )}

                    {/* Cancel Button */}
                    <div className="pt-6 border-t border-gray-800">
                      <Button
                        onClick={handleCancelAppointment}
                        disabled={isCancelling}
                        size="lg"
                        className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/40 transition-all"
                      >
                        {isCancelling ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
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
                <Card className="bg-gray-900 border border-amber-500/20 shadow-xl shadow-amber-500/10 text-white">
                  <CardContent className="text-center py-16">
                    <div className="h-20 w-20 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-6 border border-amber-500/20">
                      <AlertCircle className="h-10 w-10 text-amber-500/80" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-3 bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">No Confirmed Appointment</h3>
                    <p className="text-gray-300 mb-6 max-w-md mx-auto">
                      {responseData.action === 'DECLINE'
                        ? 'You declined this appointment. The slot has been released.'
                        : responseData.error
                          ? 'There was an error with your appointment request.'
                          : 'No confirmed appointment found.'
                      }
                    </p>
                    <Button
                      onClick={() => window.location.href = '/booking'}
                      className="bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all hover:from-amber-600 hover:to-amber-700"
                    >
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
