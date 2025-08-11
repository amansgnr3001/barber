import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface SectionProps { id?: string }

const Availability: React.FC<SectionProps> = ({ id }) => {
  const { toast } = useToast();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const handleCheck = () => {
    if (!date || !time) {
      toast({
        title: "Missing Information",
        description: "Please select both date and time first.",
      });
      return;
    }
    toast({
      title: "Demo Feature",
      description: `This is a demo availability check. In a real app, we would check availability for ${date} at ${time}.`,
    });
  };

  return (
    <section id={id} className="border-b">
      <div className="container py-12 md:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight">Check Availability</h2>
          <p className="mt-2 text-muted-foreground">
            Pick a date and time to see open slots.
          </p>
        </div>
        <div className="mx-auto mt-8 flex max-w-xl flex-col gap-4 sm:flex-row">
          <Input type="date" aria-label="Choose date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Input type="time" aria-label="Choose time" value={time} onChange={(e) => setTime(e.target.value)} />
          <Button onClick={handleCheck} className="shrink-0">Check</Button>
        </div>
      </div>
    </section>
  );
};

export default Availability;
