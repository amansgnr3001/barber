import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import CustomerLogin from "./pages/CustomerLogin";
import BarberLogin from "./pages/BarberLogin";
import BarberDashboard from "./pages/BarberDashboard";
import BarberServices from "./pages/BarberServices";
import Index from "./pages/Index";
import Services from "./pages/Services";
import Booking from "./pages/Booking";
import Status from "./pages/Status";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route Component for authenticated users
const ProtectedRoute = ({
  children,
  requiredRole
}: {
  children: React.ReactNode,
  requiredRole?: 'customer' | 'barber'
}) => {
  const customerToken = localStorage.getItem('token');
  const barberToken = localStorage.getItem('barberToken');
  
  // If no role is specified, any token is acceptable
  if (!requiredRole) {
    if (!customerToken && !barberToken) {
      window.location.href = '/';
      return null;
    }
    return <>{children}</>;
  }
  
  // Check for specific role token
  if (requiredRole === 'customer' && !customerToken) {
    window.location.href = '/customer/login';
    return null;
  }
  
  if (requiredRole === 'barber' && !barberToken) {
    window.location.href = '/barber/login';
    return null;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/customer/login" element={<CustomerLogin />} />
          <Route path="/barber/login" element={<BarberLogin />} />
          <Route path="/home" element={
            <ProtectedRoute requiredRole="customer">
              <Index />
            </ProtectedRoute>
          } />
          <Route path="/services" element={
            <ProtectedRoute requiredRole="customer">
              <Services />
            </ProtectedRoute>
          } />
          <Route path="/booking" element={
            <ProtectedRoute requiredRole="customer">
              <Booking />
            </ProtectedRoute>
          } />
          <Route path="/status" element={
            <ProtectedRoute requiredRole="customer">
              <Status />
            </ProtectedRoute>
          } />
          <Route path="/barber/dashboard" element={
            <ProtectedRoute requiredRole="barber">
              <BarberDashboard />
            </ProtectedRoute>
          } />
          <Route path="/barber/services" element={
            <ProtectedRoute requiredRole="barber">
              <BarberServices />
            </ProtectedRoute>
          } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
