import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Scissors, ArrowLeft, Loader2 } from "lucide-react";

const BarberLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Using proper barber login endpoint
      const response = await fetch('http://localhost:3001/api/barber/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        // Save barber token and data in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', 'barber');
        localStorage.setItem('barberData', JSON.stringify(data.user));

        toast({
          title: "Success",
          description: "Welcome to Barber Dashboard!",
        });

        // Redirect to barber dashboard
        navigate('/barber/dashboard');
      } else {
        toast({
          title: "Error",
          description: data.error || "Login failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-gray-900 text-white p-4 relative">
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-[url('/images/barber-pattern.png')] opacity-5"></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
      
      <div className="w-full max-w-md relative">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 text-gray-300 hover:text-white hover:bg-gray-800/50 border border-transparent hover:border-amber-500/30 transition-all"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
        
        <Card className="bg-gray-900 border border-amber-500/20 shadow-xl shadow-amber-500/10 text-white">
          <CardHeader className="text-center pb-6 border-b border-gray-800">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Scissors className="h-8 w-8 text-black transform rotate-45" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold">
              <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                Barber Login
              </span>
            </CardTitle>
            <p className="text-gray-300 mt-2">Access your barber dashboard</p>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-300">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className="h-12 bg-gray-800 border-gray-700 text-white focus:border-amber-500/50 focus:ring-amber-500/20"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-300">Password</Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className="h-12 bg-gray-800 border-gray-700 text-white focus:border-amber-500/50 focus:ring-amber-500/20"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 text-lg font-medium mt-8 bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all hover:from-amber-600 hover:to-amber-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BarberLogin;