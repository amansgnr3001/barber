import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

interface SectionProps { id?: string }

const BookAppointment: React.FC<SectionProps> = ({ id }) => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !service || !date || !time) {
      toast({ title: "Missing details", description: "Please fill all fields." });
      return;
    }
    toast({
      title: "Demo Feature",
      description: `This is a demo booking. In a real app, ${name}'s ${service} appointment on ${date} at ${time} would be processed.`
    });
    // Clear form after demo submission
    setName("");
    setPhone("");
    setService("");
    setDate("");
    setTime("");
  };

  return (
    <section id={id} className="border-b">
      <div className="container py-12 md:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight">Book Appointment</h2>
          <p className="mt-2 text-muted-foreground">
            Provide your details and preferred time. We will confirm shortly.
          </p>
        </div>
        <form onSubmit={handleBook} className="mx-auto mt-8 grid max-w-2xl gap-6 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 123 4567" />
          </div>
          <div className="grid gap-2">
            <Label>Service</Label>
            <Select value={service} onValueChange={setService}>
              <SelectTrigger>
                <SelectValue placeholder="Select service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="classic-haircut">Classic Haircut</SelectItem>
                <SelectItem value="beard-trim">Beard Trim</SelectItem>
                <SelectItem value="hot-towel-shave">Hot Towel Shave</SelectItem>
                <SelectItem value="express">Express Service</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="time">Time</Label>
            <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" className="w-full sm:w-auto">Book Now</Button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default BookAppointment;
