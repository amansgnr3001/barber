import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface SectionProps { id?: string }

const team = [
  { name: "Alex Barber", role: "Lead Barber" },
  { name: "Sam Styles", role: "Senior Barber" },
  { name: "Taylor Fade", role: "Stylist" },
];

const initials = (name: string) => name.split(" ").map((n) => n[0]).join("");

const DeveloperTeam: React.FC<SectionProps> = ({ id }) => {
  return (
    <section id={id}>
      <div className="container py-12 md:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight">Developer Team</h2>
          <p className="mt-2 text-muted-foreground">
            The builders behind this barber booking experience.
          </p>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((member) => (
            <div key={member.name} className="flex items-center gap-4 rounded-lg border p-4">
              <Avatar>
                <AvatarFallback>{initials(member.name)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium leading-none">{member.name}</p>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DeveloperTeam;
