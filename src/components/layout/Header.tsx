import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate, useLocation } from "react-router-dom";
import { LogOut, Scissors } from "lucide-react";

// Customer navigation buttons
const customerNavButtons: { label: string; href: string; variant: "default" | "outline" }[] = [
  { label: "Book Now", href: "/booking", variant: "outline" },
  { label: "Status", href: "/status", variant: "outline" },
  { label: "Services", href: "/services", variant: "outline" },
  { label: "About Us", href: "#about", variant: "outline" },
  { label: "Developer Team", href: "#team", variant: "outline" },
];

// Barber navigation buttons
const barberNavButtons: { label: string; href: string; variant: "default" | "outline" }[] = [
  { label: "Dashboard", href: "/barber/dashboard", variant: "outline" },
  { label: "Services", href: "/barber/services", variant: "outline" },
  { label: "About Us", href: "#about", variant: "outline" },
  { label: "Developer Team", href: "#team", variant: "outline" },
];

const Header: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [activePage, setActivePage] = useState<string>('');
  const [isBarber, setIsBarber] = useState<boolean>(false);

  // Check user role on component mount
  useEffect(() => {
    const barberToken = localStorage.getItem('barberToken');
    setIsBarber(!!barberToken);
  }, []);

  // Update active page based on current route and user role
  useEffect(() => {
    const currentPath = location.pathname;
    
    if (isBarber) {
      // Barber routes
      if (currentPath === '/barber/dashboard') {
        setActivePage('Dashboard');
      } else if (currentPath === '/barber/services') {
        setActivePage('Services');
      } else if (currentPath === '/' || currentPath === '') {
        // Check if we're on homepage and looking at specific sections
        const hash = location.hash;
        if (hash === '#about') {
          setActivePage('About Us');
        } else if (hash === '#team') {
          setActivePage('Developer Team');
        } else {
          setActivePage(''); // Homepage, no specific section
        }
      } else {
        setActivePage('');
      }
    } else {
      // Customer routes
      if (currentPath === '/booking') {
        setActivePage('Book Now');
      } else if (currentPath === '/status') {
        setActivePage('Status');
      } else if (currentPath === '/services') {
        setActivePage('Services');
      } else if (currentPath === '/' || currentPath === '') {
        // Check if we're on homepage and looking at specific sections
        const hash = location.hash;
        if (hash === '#about') {
          setActivePage('About Us');
        } else if (hash === '#team') {
          setActivePage('Developer Team');
        } else {
          setActivePage(''); // Homepage, no specific section
        }
      } else {
        setActivePage('');
      }
    }
  }, [location, isBarber]);

  const handleLogout = () => {
    // Determine user type before clearing storage
    const isBarber = !!localStorage.getItem('barberToken');
    
    // Clear all auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('barberToken');
    localStorage.removeItem('barberData');
    localStorage.removeItem('userRole');
    
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    
    // Redirect to appropriate landing page
    navigate('/');
  };

  const handleNavClick = (e: React.MouseEvent, label: string, href: string) => {
    e.preventDefault();

    // Update active page immediately for better UX
    setActivePage(label);

    // Handle navigation based on button label
    if (isBarber) {
      // Barber navigation
      if (label === "Dashboard") {
        navigate('/barber/dashboard');
      } else if (label === "Services") {
        navigate('/barber/services');
      } else {
        // Handle other navigation buttons (About Us, Developer Team)
        toast({
          title: "Demo Navigation",
          description: `This is a demo ${label} button. The section is already visible on the page.`,
        });
      }
    } else {
      // Customer navigation
      if (label === "Services") {
        navigate('/services');
      } else if (label === "Book Now") {
        navigate('/booking');
      } else if (label === "Status") {
        navigate('/status');
      } else {
        // Handle other navigation buttons (About Us, Developer Team)
        toast({
          title: "Demo Navigation",
          description: `This is a demo ${label} button. The section is already visible on the page.`,
        });
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-gradient-to-r from-black via-gray-900 to-black text-white shadow-md">
      <nav className="container flex h-20 items-center justify-between" aria-label="Main Navigation">
        <button
          onClick={(e) => {
            e.preventDefault();
            // Navigate to appropriate home page based on user role
            navigate(isBarber ? '/barber/dashboard' : '/home');
          }}
          className="flex items-center gap-2 font-bold text-xl tracking-tight hover:opacity-80 transition-all duration-200"
        >
          <div className="h-10 w-10 rounded-full bg-amber-500 flex items-center justify-center">
            <Scissors className="h-5 w-5 text-black transform -rotate-45" />
          </div>
          <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
            Barber Suite
          </span>
        </button>
        <div className="flex flex-wrap items-center gap-3 overflow-x-auto">
          {(isBarber ? barberNavButtons : customerNavButtons).map((btn) => {
            const isActive = activePage === btn.label;
            return (
              <Button
                key={btn.href}
                size="sm"
                variant={isActive ? "default" : btn.variant}
                onClick={(e) => handleNavClick(e, btn.label, btn.href)}
                className={
                  isActive
                    ? "bg-amber-500 text-black hover:bg-amber-600 font-medium"
                    : "bg-transparent text-white border border-amber-500/30 hover:bg-amber-500/10 hover:border-amber-500 transition-all duration-200"
                }
              >
                {btn.label}
              </Button>
            );
          })}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleLogout}
            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
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
