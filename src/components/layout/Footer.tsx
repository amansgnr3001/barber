import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="border-t">
      <div className="container flex flex-col items-center justify-between gap-3 py-4 md:h-14 md:flex-row">
        <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Barber Suite</p>
        <p className="text-lg md:text-xl font-semibold text-foreground">RRU haircutting</p>
        <nav className="flex items-center gap-6" aria-label="Footer Navigation">
          <a href="#services" className="text-sm text-muted-foreground hover:text-foreground">Services</a>
          <a href="#availability" className="text-sm text-muted-foreground hover:text-foreground">Availability</a>
          <a href="#book" className="text-sm text-muted-foreground hover:text-foreground">Book</a>
          <a href="#about" className="text-sm text-muted-foreground hover:text-foreground">About</a>
          <a href="#team" className="text-sm text-muted-foreground hover:text-foreground">Team</a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
