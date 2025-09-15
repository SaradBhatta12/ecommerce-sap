"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

// Centralized redirect logic for admin context
function performRedirect(router: any, url: string) {
  router.push(url);
}

export default function AdminLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Centralized state management
  const [activeTab, setActiveTab] = useState("google");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  
  // Centralized URL parameter parsing
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";
  const errorFromUrl = searchParams.get("error");

  // Centralized error handling
  useEffect(() => {
    if (errorFromUrl) {
      if (errorFromUrl === "OAuthAccountNotLinked") {
        setError(
          "This email is already registered with another sign-in method. Please use that method to log in."
        );
      } else if (errorFromUrl === "CredentialsSignin") {
        setError("Invalid credentials. Please try again.");
      } else {
        setError(errorFromUrl);
      }
    }
  }, [errorFromUrl]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await signIn("google", {
        redirect: false,
        callbackUrl,
      });
      
      if (result?.error) {
        setError("Authentication failed. Please try again.");
        setIsLoading(false);
        return;
      }
      
      if (result?.url) {
        // Use centralized redirect logic
        performRedirect(router, result.url);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError("Authentication failed. Please try again.");
      setIsLoading(false);
    }
  };

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email: formData.email,
      password: formData.password,
      userType: "admin",
      redirect: false,
      callbackUrl,
    });

    if (result?.error) {
      setError("Invalid credentials or unauthorized access");
      setIsLoading(false);
      return;
    }

    if (result?.url) {
      // Use centralized redirect logic
      performRedirect(router, result.url);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="flex h-full items-center justify-center bg-gray-100 dark:bg-gray-900 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Admin Login</CardTitle>
          <CardDescription className="text-center">
            Sign in to your admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          <Tabs defaultValue="google" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="google">Google</TabsTrigger>
              <TabsTrigger value="credentials">Email</TabsTrigger>
            </TabsList>
            
            <TabsContent value="google" className="mt-6">
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <svg
                  className="h-5 w-5"
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fab"
                  data-icon="google"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 488 512"
                >
                  <path
                    fill="currentColor"
                    d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                  />
                </svg>
                {isLoading ? "Logging in..." : "Log in with Google"}
              </Button>
            </TabsContent>
            
            <TabsContent value="credentials" className="mt-6">
              <form onSubmit={handleCredentialsLogin} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="admin@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    placeholder="••••••••"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
