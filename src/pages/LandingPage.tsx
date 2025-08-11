import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Scissors } from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-6">
          <Scissors className="h-12 w-12 text-primary mr-3" />
          <h1 className="text-5xl font-bold text-primary">Barber Suite</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Professional barber services at your fingertips. Book appointments, manage services, and experience premium grooming.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">
        {/* Customer Login Card */}
        <Card className="w-full hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 hover:border-primary/20">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <Users className="h-16 w-16 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-primary">Customer Portal</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <p className="text-muted-foreground text-center leading-relaxed">
              Book appointments, view services, and manage your grooming schedule with ease.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground text-center">
              <p>✓ Easy appointment booking</p>
              <p>✓ Service catalog browsing</p>
              <p>✓ Schedule management</p>
            </div>
            <Button 
              className="w-full max-w-xs mt-6 h-12 text-lg font-semibold"
              onClick={() => navigate('/customer/login')}
            >
              Login as Customer
            </Button>
          </CardContent>
        </Card>

        {/* Barber Login Card */}
        <Card className="w-full hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 hover:border-secondary/20">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <Scissors className="h-16 w-16 text-secondary-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold text-secondary-foreground">Barber Portal</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <p className="text-muted-foreground text-center leading-relaxed">
              Manage appointments, services, and grow your barbering business efficiently.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground text-center">
              <p>✓ Appointment management</p>
              <p>✓ Service administration</p>
              <p>✓ Business analytics</p>
            </div>
            <Button 
              className="w-full max-w-xs mt-6 h-12 text-lg font-semibold"
              onClick={() => navigate('/barber/login')}
              variant="secondary"
            >
              Login as Barber
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 text-center">
        <p className="text-sm text-muted-foreground">
          © 2024 Barber Suite. Professional grooming services made simple.
        </p>
      </div>
    </div>
  );
};

export default LandingPage;