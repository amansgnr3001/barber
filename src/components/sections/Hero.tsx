import React from "react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

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
    <section id={id} className="border-b">
      <div className="container py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Premium Barber Services – Book Your Appointment
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Clean cuts, sharp fades, and classic styles delivered with care.
            Discover services, check availability, and book instantly.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              onClick={handleBookNow}
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Book Now
            </button>
            <button
              onClick={handleViewServices}
              className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-6 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              View Services
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
