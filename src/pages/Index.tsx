import Header from "@/components/layout/Header";
import SEO from "@/components/seo/SEO";
import Hero from "@/components/sections/Hero";
import Services from "@/components/sections/Services";
import BookAppointment from "@/components/sections/BookAppointment";
import AboutUs from "@/components/sections/AboutUs";
import DeveloperTeam from "@/components/sections/DeveloperTeam";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Barber Services | Book Appointment Online"
        description="Explore barber services, check availability, and book your appointment online."
      />
      <Header />
      <main id="content" className="text-center">
        <Hero />
        <Services id="services" />
        <BookAppointment id="book" />
        <AboutUs id="about" />
        <DeveloperTeam id="team" />
      </main>
    </div>
  );
};

export default Index;
