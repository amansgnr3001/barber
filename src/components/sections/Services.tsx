import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scissors, Sparkles, Brush, Clock } from "lucide-react";

interface SectionProps { id?: string }

const services = [
  { title: "Classic Haircut", icon: Scissors, desc: "Timeless styles tailored to you." },
  { title: "Beard Trim", icon: Brush, desc: "Line-ups, trims, and razor finishes." },
  { title: "Hot Towel Shave", icon: Sparkles, desc: "Relaxing shave with premium products." },
  { title: "Express Service", icon: Clock, desc: "On-the-go clean up in minutes." },
];

const Services: React.FC<SectionProps> = ({ id }) => {
  return (
    <section id={id} className="border-b">
      <div className="container py-12 md:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight">Our Services</h2>
          <p className="mt-2 text-muted-foreground">
            Barber-centric offerings designed for precision and comfort.
          </p>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map(({ title, icon: Icon, desc }) => (
            <Card key={title}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon aria-hidden className="opacity-80" />
                  <span>{title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
