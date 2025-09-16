"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function SeedPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; data?: any } | null>(null)
  const router = useRouter()


  const handleSeed = async () => {
    if (
      !confirm(
        "This will delete all existing products, categories, and brands and replace them with sample data. Are you sure you want to continue?",
      )
    ) {
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/seed")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to seed data")
      }

      setResult({
        success: true,
        message: "Sample data has been successfully created!",
        data,
      })

      toast.success("Success", {
        description: "Sample data has been created successfully.",
      })

      // Refresh the page data
      router.refresh()
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred",
      })

      toast.error("Error", {
        description: error instanceof Error ? error.message : "Failed to seed data",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Seed Database</h2>
        <p className="text-muted-foreground">Create sample data for testing</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Sample Data</CardTitle>
          <CardDescription>
            This will create sample categories, brands, and products for testing purposes. Any existing data will be
            deleted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            The following sample data will be created:
            <ul className="mt-2 list-disc pl-5">
              <li>6 product categories</li>
              <li>5 brands</li>
              <li>8 products with variants and details</li>
            </ul>
          </p>

          {result && (
            <Alert className="mt-4" variant={result.success ? "default" : "destructive"}>
              {result.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
              <AlertDescription>{result.message}</AlertDescription>
              {result.success && result.data && (
                <div className="mt-2 text-sm">
                  <p>Created:</p>
                  <ul className="list-disc pl-5">
                    <li>{result.data.categories} categories</li>
                    <li>{result.data.brands} brands</li>
                    <li>{result.data.products} products</li>
                  </ul>
                </div>
              )}
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleSeed} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Creating Sample Data..." : "Create Sample Data"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
