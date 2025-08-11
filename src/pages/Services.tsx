import React, { useState, useEffect } from "react";
// Rolled back to direct fetch
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Scissors, Sparkles, Brush, Clock, Loader2 } from "lucide-react";
import Header from "@/components/layout/Header";
import SEO from "@/components/seo/SEO";

interface Service {
  _id: string;
  name: string;
  cost: string;
  time: string;
  gender: string;
}

const Services = () => {
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGender, setSelectedGender] = useState<string>('all');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        console.log('Fetching services from:', 'http://localhost:3001/api/services');
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3001/api/services', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch services: ${response.status}`);
        }
        const data = await response.json();
        console.log('Services data received:', data);
        setServices(data);
        setFilteredServices(data);
      } catch (error) {
        console.error('Error fetching services:', error);
        toast({
          title: "Error",
          description: "Failed to load services. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, [toast]);

  useEffect(() => {
    // Filter services based on selected gender
    if (selectedGender === 'all') {
      setFilteredServices(services);
    } else {
      setFilteredServices(services.filter(service => service.gender === selectedGender));
    }
  }, [selectedGender, services]);

  const getServiceIcon = (serviceName: string) => {
    const name = serviceName.toLowerCase();
    if (name.includes('haircut')) return Scissors;
    if (name.includes('beard') || name.includes('trim')) return Brush;
    if (name.includes('shave')) return Sparkles;
    return Clock;
  };

  const getGenderBadgeVariant = (gender: string) => {
    return gender === 'male' ? 'default' : 'secondary';
  };

  const handleGenderChange = (value: string) => {
    setSelectedGender(value);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Our Services | Barber Suite"
        description="Explore our premium barber services including haircuts, beard trims, shaves, and more."
      />
      <Header />
      <main className="container py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl mb-4">
            Our Services
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Discover our comprehensive range of premium barber services. 
            From classic haircuts to modern styling, we've got you covered.
          </p>
          
          {/* Filter Dropdown */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-3">
              <label htmlFor="gender-filter" className="text-sm font-medium">
                Filter by Gender:
              </label>
              <Select value={selectedGender} onValueChange={handleGenderChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  <SelectItem value="male">Male Services</SelectItem>
                  <SelectItem value="female">Female Services</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Results Count */}
          <p className="text-sm text-muted-foreground">
            Showing {filteredServices.length} of {services.length} services
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-12 w-12 animate-spin" />
            <span className="ml-3 text-lg">Loading services...</span>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">
              No services found for the selected filter.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredServices.map((service) => {
              const IconComponent = getServiceIcon(service.name);
              return (
                <Card key={service._id} className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <IconComponent aria-hidden className="opacity-80 h-5 w-5" />
                      <span className="text-lg">{service.name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          Duration: {service.time}
                        </p>
                        <Badge variant={getGenderBadgeVariant(service.gender)}>
                          {service.gender}
                        </Badge>
                      </div>
                      <p className="text-xl font-semibold text-primary">
                        {service.cost}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Services; 