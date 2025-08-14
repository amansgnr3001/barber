import React from "react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Scissors, Calendar, Clock } from "lucide-react";

interface SectionProps {
  id?: string;
}

const Hero: React.FC<SectionProps> = ({ id }) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleBookNow = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('Navigating to Booking page');
    navigate('/booking');
  };

  const handleViewServices = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('Navigating to Services page');
    navigate('/services');
  };

  return (
    <section
      id={id}
      className="relative bg-gradient-to-b from-gray-900 to-black border-b border-amber-500/20 overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-[url('/images/barber-pattern.png')] opacity-5"></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
      
      <div className="container relative py-20 md:py-32">
        <div className="mx-auto max-w-4xl">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Scissors className="h-8 w-8 text-black transform -rotate-45" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-center">
            <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">Premium Barber</span>
            <span className="text-white"> Services</span>
          </h1>
          
          <p className="mt-6 text-xl text-gray-300 text-center max-w-2xl mx-auto">
            Clean cuts, sharp fades, and classic styles delivered with precision and care.
            Experience the art of grooming at its finest.
          </p>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-xl mx-auto">
            <div className="flex items-center justify-center gap-3 bg-gray-800/50 p-4 rounded-lg border border-gray-700 hover:border-amber-500/30 transition-all">
              <Clock className="h-5 w-5 text-amber-500" />
              <span className="text-gray-300">Open 9am - 8pm, Mon-Sat</span>
            </div>
            <div className="flex items-center justify-center gap-3 bg-gray-800/50 p-4 rounded-lg border border-gray-700 hover:border-amber-500/30 transition-all">
              <Calendar className="h-5 w-5 text-amber-500" />
              <span className="text-gray-300">Online Booking Available</span>
            </div>
          </div>
          
          <div className="mt-10 flex flex-col md:flex-row items-center justify-center gap-4">
            <button
              onClick={handleBookNow}
              className="w-full md:w-auto px-8 py-3 rounded-md bg-gradient-to-r from-amber-500 to-amber-600 text-black font-medium shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all hover:from-amber-600 hover:to-amber-700"
            >
              Book Your Appointment
            </button>
            <button
              onClick={handleViewServices}
              className="w-full md:w-auto px-8 py-3 rounded-md bg-transparent text-amber-400 font-medium border border-amber-500/30 hover:bg-amber-500/10 hover:border-amber-500 transition-all"
            >
              View Our Services
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
