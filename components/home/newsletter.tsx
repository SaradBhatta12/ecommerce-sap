"use client";

import type React from "react";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setEmail("");
      toast({
        title: "Subscription successful!",
        description: "Thank you for subscribing to our newsletter.",
      });
    }, 1000);
  };

  return (
    <section className="bg-muted py-12">
      <div className=" px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Subscribe to Our Newsletter
          </h2>
          <p className="max-w-[600px] text-muted-foreground">
            Stay updated with the latest products, exclusive offers, and
            seasonal discounts.
          </p>
          <form
            onSubmit={handleSubmit}
            className="flex w-full max-w-md flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0"
          >
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="sm:flex-1"
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Subscribing..." : "Subscribe"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
