"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

// Sample data - would come from API in real implementation
const testimonials = [
  {
    id: "1",
    name: "Aarav Sharma",
    location: "Kathmandu",
    image: "/placeholder.svg?height=100&width=100",
    rating: 5,
    text: "I've been shopping on NepalMart for over a year now. The quality of products and customer service is exceptional. Fast delivery to Kathmandu!",
  },
  {
    id: "2",
    name: "Sita Tamang",
    location: "Pokhara",
    image: "/placeholder.svg?height=100&width=100",
    rating: 4,
    text: "Love the traditional handicrafts available here. The Pashmina shawl I ordered was beautiful and arrived well-packaged. Will shop again!",
  },
  {
    id: "3",
    name: "Bijay Thapa",
    location: "Biratnagar",
    image: "/placeholder.svg?height=100&width=100",
    rating: 5,
    text: "Great experience shopping during Dashain festival. The discounts were amazing and the Khalti payment process was smooth and secure.",
  },
  {
    id: "4",
    name: "Priya Gurung",
    location: "Butwal",
    image: "/placeholder.svg?height=100&width=100",
    rating: 5,
    text: "The Lokta paper products I ordered were of excellent quality. Shipping to Butwal was faster than expected. Highly recommend!",
  },
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerView = 3;
  const maxIndex = Math.max(0, testimonials.length - itemsPerView);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const visibleTestimonials = testimonials.slice(
    currentIndex,
    currentIndex + itemsPerView
  );

  return (
    <section className="py-12">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
          What Our Customers Say
        </h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={prevTestimonial}
            disabled={currentIndex === 0}
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={nextTestimonial}
            disabled={currentIndex >= maxIndex}
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visibleTestimonials.map((testimonial) => (
          <Card key={testimonial.id}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Image
                  src={testimonial.image || "/placeholder.svg"}
                  alt={testimonial.name}
                  width={50}
                  height={50}
                  className="rounded-full"
                />
                <div>
                  <h3 className="font-medium">{testimonial.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.location}
                  </p>
                </div>
              </div>
              <div className="mt-2 flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < testimonial.rating
                        ? "fill-primary text-primary"
                        : "text-muted"
                    }`}
                  />
                ))}
              </div>
              <p className="mt-4 text-sm">{testimonial.text}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
