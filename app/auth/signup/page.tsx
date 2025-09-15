"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

// Centralized redirect logic for admin context
function performRedirect(router: any, url: string) {
  router.push(url);
}

export default function SignUp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Centralized state management
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Centralized URL parameter parsing
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";
  const errorFromUrl = searchParams.get("error");

  // Centralized error handling
  useEffect(() => {
    if (errorFromUrl) {
      if (errorFromUrl === "OAuthAccountNotLinked") {
        setError(
          "This email is already registered with another sign-in method. Please use that method to sign in."
        );
      } else if (errorFromUrl === "CredentialsSignin") {
        setError("Invalid credentials. Please try again.");
      } else {
        setError(errorFromUrl);
      }
    }
  }, [errorFromUrl]);

  const handleGoogleSignIn = async () => {
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
      console.error('Signup error:', error);
      setError("Authentication failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 px-4 py-12">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg p-8 shadow">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
          Sign Up
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <Button
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
          onClick={handleGoogleSignIn}
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
          {isLoading ? "Signing up..." : "Sign up with Google"}
        </Button>
      </div>
    </div>
  );
}
