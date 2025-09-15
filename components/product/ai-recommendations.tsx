"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Brain, RefreshCw, ThumbsUp, ThumbsDown } from "lucide-react"
import ProductCard from "@/components/product/product-card"

interface AIRecommendationsProps {
  productId?: string
  category?: string
}

export default function AIRecommendations({ productId, category }: AIRecommendationsProps) {
  const { data: session } = useSession()
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("personalized")
  const [feedback, setFeedback] = useState<Record<string, "like" | "dislike" | null>>({})

  useEffect(() => {
    fetchRecommendations()
  }, [productId, category, activeTab])

  const fetchRecommendations = async () => {
    setLoading(true)
    try {
      // In a real app, this would be a call to an AI recommendation engine
      // Simulating API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock data
      const mockRecommendations = Array(8)
        .fill(null)
        .map((_, i) => ({
          _id: `rec-${i}`,
          name: `AI Recommended Product ${i + 1}`,
          price: Math.floor(Math.random() * 10000) + 1000,
          images: ["/placeholder.svg?height=300&width=300"],
          rating: Math.floor(Math.random() * 5) + 1,
          reviews: Math.floor(Math.random() * 100),
          isNew: Math.random() > 0.7,
          isOnSale: Math.random() > 0.7,
          discount: Math.floor(Math.random() * 30) + 10,
          slug: `ai-recommended-product-${i + 1}`,
        }))

      setRecommendations(mockRecommendations)
    } catch (error) {
      console.error("Error fetching recommendations:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFeedback = (productId: string, type: "like" | "dislike") => {
    setFeedback((prev) => ({
      ...prev,
      [productId]: type,
    }))

    // In a real app, send this feedback to the AI system to improve recommendations
    console.log(`User ${type}d product ${productId}`)
  }

  const renderSkeletons = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array(8)
        .fill(null)
        .map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <CardContent className="p-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-8 w-full" />
            </CardContent>
          </Card>
        ))}
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold">AI Recommendations</h2>
        </div>
        <Button variant="outline" size="sm" onClick={fetchRecommendations} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="personalized" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personalized">Personalized</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="similar">Similar Items</TabsTrigger>
        </TabsList>

        {["personalized", "trending", "similar"].map((tab) => (
          <TabsContent key={tab} value={tab} className="pt-4">
            {loading ? (
              renderSkeletons()
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {recommendations.map((product) => (
                  <div key={product._id} className="space-y-2">
                    <ProductCard product={product} />
                    <div className="flex justify-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className={feedback[product._id] === "like" ? "bg-primary/10" : ""}
                        onClick={() => handleFeedback(product._id, "like")}
                      >
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        <span className="sr-only md:not-sr-only md:inline-block">Helpful</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className={feedback[product._id] === "dislike" ? "bg-destructive/10" : ""}
                        onClick={() => handleFeedback(product._id, "dislike")}
                      >
                        <ThumbsDown className="h-4 w-4 mr-1" />
                        <span className="sr-only md:not-sr-only md:inline-block">Not for me</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
