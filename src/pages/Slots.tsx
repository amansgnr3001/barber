import React, { useState, useEffect } from "react";
// Rolled back to direct fetch
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Clock, Calendar } from "lucide-react";
import Header from "@/components/layout/Header";
import SEO from "@/components/seo/SEO";

interface Slot {
  _id: string;
  day: string;
  morning: string | null;
  afternoon: string | null;
  evening: string | null;
}

const Slots = () => {
  const { toast } = useToast();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slots1, setSlots1] = useState<Slot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGender, setSelectedGender] = useState<string>('male');

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        setIsLoading(true);
        
        // Fetch both male and female slots
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const [maleResponse, femaleResponse] = await Promise.all([
          fetch('http://localhost:3001/api/slots', { headers }),
          fetch('http://localhost:3001/api/slots1', { headers })
        ]);

        if (!maleResponse.ok || !femaleResponse.ok) {
          throw new Error('Failed to fetch slots data');
        }

        const maleData = await maleResponse.json();
        const femaleData = await femaleResponse.json();

        setSlots(maleData);
        setSlots1(femaleData);
      } catch (error) {
        console.error('Error fetching slots:', error);
        toast({
          title: "Error",
          description: "Failed to load slots data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSlots();
  }, [toast]);

  const handleGenderChange = (value: string) => {
    setSelectedGender(value);
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return 'Not available';
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getCurrentSlots = () => {
    return selectedGender === 'male' ? slots : slots1;
  };

  const getGenderLabel = () => {
    return selectedGender === 'male' ? 'Male' : 'Female';
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Available Slots | Barber Suite"
        description="View available appointment slots for our barber services."
      />
      <Header />
      <main className="container py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl mb-4">
              Available Slots
            </h1>
            <p className="text-lg text-muted-foreground">
              Check our available appointment slots for the week.
            </p>
          </div>

          {/* Gender Selection */}
          <div className="mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center space-x-4">
                  <span className="text-sm font-medium">Select Gender:</span>
                  <Select value={selectedGender} onValueChange={handleGenderChange}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male Services</SelectItem>
                      <SelectItem value="female">Female Services</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Loading slots...</span>
              </div>
            </div>
          ) : (
            <div className="grid gap-6">
              <div className="text-center">
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {getGenderLabel()} Services Schedule
                </Badge>
              </div>

              {getCurrentSlots().map((slot) => (
                <Card key={slot._id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      {slot.day}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-orange-500" />
                          <span className="font-medium">Morning</span>
                        </div>
                        {slot.morning ? (
                          <Badge variant="outline">{formatTime(slot.morning)}</Badge>
                        ) : (
                          <Badge variant="secondary">Not available</Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">Afternoon</span>
                        </div>
                        {slot.afternoon ? (
                          <Badge variant="outline">{formatTime(slot.afternoon)}</Badge>
                        ) : (
                          <Badge variant="secondary">Not available</Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-purple-500" />
                          <span className="font-medium">Evening</span>
                        </div>
                        {slot.evening ? (
                          <Badge variant="outline">{formatTime(slot.evening)}</Badge>
                        ) : (
                          <Badge variant="secondary">Not available</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className="text-center mt-8">
                <p className="text-sm text-muted-foreground">
                  All times are subject to availability. Book your appointment to secure your preferred slot.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Slots; 