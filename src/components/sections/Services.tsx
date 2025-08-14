import React from "react";
import { Scissors, Sparkles, Brush, Clock } from "lucide-react";

interface SectionProps { id?: string }

const services = [
  {
    title: "Classic Haircut",
    icon: Scissors,
    desc: "Timeless styles tailored to your face shape and personal preferences.",
    price: "$25",
    duration: "30 min"
  },
  {
    title: "Beard Trim",
    icon: Brush,
    desc: "Precise line-ups, shape-ups, and razor finishes for the perfect beard.",
    price: "$15",
    duration: "20 min"
  },
  {
    title: "Hot Towel Shave",
    icon: Sparkles,
    desc: "Relaxing traditional shave with hot towels and premium products.",
    price: "$35",
    duration: "45 min"
  },
  {
    title: "Express Service",
    icon: Clock,
    desc: "Quick touch-ups and clean-ups when you're on the go.",
    price: "$18",
    duration: "15 min"
  },
];

const Services: React.FC<SectionProps> = ({ id }) => {
  return (
    <section id={id} className="relative bg-gradient-to-b from-black to-gray-900 border-b border-amber-500/20">
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-[url('/images/barber-pattern.png')] opacity-5"></div>
      
      <div className="container py-16 md:py-24 relative">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">Our Premium</span>
            <span className="text-white"> Services</span>
          </h2>
          <p className="mt-4 text-lg text-gray-300">
            Exceptional grooming services designed for the modern gentleman.
          </p>
        </div>
        
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {services.map(({ title, icon: Icon, desc, price, duration }) => (
            <div
              key={title}
              className="group relative bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700 hover:border-amber-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10"
            >
              {/* Top accent bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-amber-600 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-full bg-gray-900 flex items-center justify-center border border-amber-500/30 group-hover:bg-amber-500/20 transition-colors duration-300">
                    <Icon className="h-6 w-6 text-amber-500" aria-hidden />
                  </div>
                  <h3 className="text-xl font-semibold text-white">{title}</h3>
                </div>
                
                <p className="text-gray-300 mb-6">{desc}</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-400">{duration}</span>
                  </div>
                  <span className="text-xl font-bold text-amber-500">{price}</span>
                </div>
              </div>
              
              <div className="p-4 bg-gray-900 text-center">
                <button className="w-full py-2 text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors">
                  Book This Service
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
