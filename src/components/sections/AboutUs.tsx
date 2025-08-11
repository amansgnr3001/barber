import React from "react";

interface SectionProps { id?: string }

const AboutUs: React.FC<SectionProps> = ({ id }) => {
  return (
    <section id={id} className="border-b">
      <div className="container py-12 md:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight">About Us</h2>
          <p className="mt-2 text-muted-foreground">
            We are a modern barber studio focused on precision cuts, classic shaves,
            and a welcoming experience. Our barbers are trained in contemporary and
            traditional techniques to ensure you always look your best.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
