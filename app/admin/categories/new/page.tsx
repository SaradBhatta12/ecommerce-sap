"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import CategoryForm from "@/components/admin/category-form"
import { Skeleton } from "@/components/ui/skeleton"

export default function NewCategoryPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("/api/categories")
        const data = await response.json()
        setCategories(data.categories || [])
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch categories",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [toast])

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 md:p-8 pt-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Add New Category</h2>
          <p className="text-muted-foreground">Create a new product category</p>
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-8 pt-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Add New Category</h2>
        <p className="text-muted-foreground">Create a new product category</p>
      </div>
      <CategoryForm categories={categories} />
    </div>
  )
}
