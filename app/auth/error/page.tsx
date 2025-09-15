"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function AuthError() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      switch (errorParam) {
        case "Signin":
          setError("Try signing in with a different account.");
          break;
        case "OAuthSignin":
          setError("Try signing in with a different account.");
          break;
        case "OAuthCallback":
          setError("Try signing in with a different account.");
          break;
        case "OAuthCreateAccount":
          setError("Try signing in with a different account.");
          break;
        case "EmailCreateAccount":
          setError("Try signing in with a different account.");
          break;
        case "Callback":
          setError("Try signing in with a different account.");
          break;
        case "OAuthAccountNotLinked":
          setError(
            "To confirm your identity, sign in with the same account you used originally."
          );
          break;
        case "EmailSignin":
          setError("Check your email address.");
          break;
        case "CredentialsSignin":
          setError(
            "Sign in failed. Check the details you provided are correct."
          );
          break;
        case "SessionRequired":
          setError("Please sign in to access this page.");
          break;
        default:
          setError("Unable to sign in.");
          break;
      }
    }
  }, [searchParams]);

  return (
    <div className=" flex h-screen w-screen flex-col items-center justify-center">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center text-destructive mb-2">
            <AlertCircle className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl text-center">
            Authentication Error
          </CardTitle>
          <CardDescription className="text-center">
            {error || "An error occurred during authentication."}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          Please try again or contact support if the problem persists.
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/auth/login">
            <Button>Back to Sign In</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
