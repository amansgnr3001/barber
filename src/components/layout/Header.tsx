import React from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

const navButtons: { label: string; href: string; variant: "default" | "outline" }[] = [
  { label: "Book Now", href: "/booking", variant: "default" },
  { label: "Services", href: "/services", variant: "outline" },
  { label: "Slots", href: "/slots", variant: "outline" },
  { label: "Check Availability", href: "#availability", variant: "outline" },
  { label: "About Us", href: "#about", variant: "outline" },
  { label: "Developer Team", href: "#team", variant: "outline" },
];

const Header: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('barberToken');
    localStorage.removeItem('barberData');
    
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    
    navigate('/');
  };

  const handleNavClick = (e: React.MouseEvent, label: string, href: string) => {
    e.preventDefault();
    
    if (label === "Services") {
      // Navigate to Services page
      console.log('Navigating to Services page');
      navigate('/services');
    } else if (label === "Book Now") {
      // Navigate to Booking page
      console.log('Navigating to Booking page');
      navigate('/booking');
    } else if (label === "Slots") {
      // Navigate to Slots page
      console.log('Navigating to Slots page');
      navigate('/slots');
    } else {
      // Handle other navigation buttons
      toast({
        title: "Demo Navigation",
        description: `This is a demo ${label} button. The section is already visible on the page.`,
      });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-16 items-center justify-between" aria-label="Main Navigation">
        <button 
          onClick={(e) => {
            e.preventDefault();
            navigate('/home');
          }}
          className="font-semibold tracking-tight hover:opacity-80"
        >
          Barber Suite
        </button>
        <div className="flex flex-wrap items-center gap-2 overflow-x-auto">
          {navButtons.map((btn) => (
            <Button 
              key={btn.href} 
              size="sm" 
              variant={btn.variant}
              onClick={(e) => handleNavClick(e, btn.label, btn.href)}
            >
              {btn.label}
            </Button>
          ))}
          <Button 
            size="sm" 
            variant="ghost"
            onClick={handleLogout}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4 mr-1" />
            Logout
          </Button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
