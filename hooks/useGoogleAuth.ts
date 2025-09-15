import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";

export const useGoogleAuth = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogle = async (callbackUrlOverride?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Use provided callback URL or default to dashboard
      const callbackUrl = callbackUrlOverride || '/dashboard';
      
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
        router.push(result.url);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError("Authentication failed. Please try again.");
      setIsLoading(false);
    }
  };

  return { handleGoogle, error, isLoading, setError };
};
