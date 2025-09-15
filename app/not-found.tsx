import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="text-center space-y-8 px-4">
        <div className="space-y-4">
          <h1 className="text-8xl md:text-9xl font-bold text-gray-800 tracking-tight">
            404
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-700">
            Error
          </h2>
        </div>
        
        <div className="space-y-4">
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <Link href="/">
            <Button 
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-8 py-3 rounded-full font-medium transition-colors"
              variant="secondary"
            >
              HOME
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
