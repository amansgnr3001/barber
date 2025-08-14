import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Scissors, Star } from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-black to-gray-900 text-white p-4 relative">
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-[url('/images/barber-pattern.png')] opacity-5"></div>
      <div className="absolute top-1/4 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
      
      <div className="text-center mb-16 relative z-10">
        <div className="flex items-center justify-center mb-8">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 mr-4">
            <Scissors className="h-10 w-10 text-black transform rotate-45" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold">
            <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
              Barber Suite
            </span>
          </h1>
        </div>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Professional barber services at your fingertips. Book appointments, manage services, and experience premium grooming.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full relative z-10">
        {/* Customer Login Card */}
        <Card className="w-full hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gray-900 border border-amber-500/20 shadow-xl shadow-amber-500/10 text-white">
          <CardHeader className="text-center pb-6 border-b border-gray-800">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Users className="h-8 w-8 text-black" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                Customer Portal
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-5 pt-6">
            <p className="text-gray-300 text-center leading-relaxed">
              Book appointments, view services, and manage your grooming schedule with ease.
            </p>
            <div className="space-y-3 text-sm text-center w-full">
              <p className="flex items-center justify-center text-gray-200">
                <Star className="h-4 w-4 text-amber-500 mr-2" /> Easy appointment booking
              </p>
              <p className="flex items-center justify-center text-gray-200">
                <Star className="h-4 w-4 text-amber-500 mr-2" /> Service catalog browsing
              </p>
              <p className="flex items-center justify-center text-gray-200">
                <Star className="h-4 w-4 text-amber-500 mr-2" /> Schedule management
              </p>
            </div>
            <Button
              className="w-full max-w-xs mt-6 h-12 text-lg font-medium bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all hover:from-amber-600 hover:to-amber-700"
              onClick={() => navigate('/customer/login')}
            >
              Login as Customer
            </Button>
          </CardContent>
        </Card>

        {/* Barber Login Card */}
        <Card className="w-full hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gray-900 border border-amber-500/20 shadow-xl shadow-amber-500/10 text-white">
          <CardHeader className="text-center pb-6 border-b border-gray-800">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Scissors className="h-8 w-8 text-black transform rotate-45" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                Barber Portal
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-5 pt-6">
            <p className="text-gray-300 text-center leading-relaxed">
              Manage appointments, services, and grow your barbering business efficiently.
            </p>
            <div className="space-y-3 text-sm text-center w-full">
              <p className="flex items-center justify-center text-gray-200">
                <Star className="h-4 w-4 text-amber-500 mr-2" /> Appointment management
              </p>
              <p className="flex items-center justify-center text-gray-200">
                <Star className="h-4 w-4 text-amber-500 mr-2" /> Service administration
              </p>
              <p className="flex items-center justify-center text-gray-200">
                <Star className="h-4 w-4 text-amber-500 mr-2" /> Business analytics
              </p>
            </div>
            <Button
              className="w-full max-w-xs mt-6 h-12 text-lg font-medium bg-gradient-to-r from-gray-800 to-black text-amber-500 border border-amber-500/30 shadow-lg hover:shadow-amber-500/20 transition-all hover:border-amber-500/50"
              onClick={() => navigate('/barber/login')}
            >
              Login as Barber
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-16 text-center relative z-10">
        <p className="text-sm text-gray-400">
          © 2024 Barber Suite. Professional grooming services made simple.
        </p>
      </div>
    </div>
  );
};

export default LandingPage;