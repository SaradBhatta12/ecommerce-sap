"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Skeleton } from "@/components/ui/skeleton"
import { useGetCategoriesQuery, useGetBrandsQuery } from "@/store/api/productsApi"

  function ProductFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [priceRange, setPriceRange] = useState([0, 20000])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [onSale, setOnSale] = useState(false)

  // RTK Query hooks for fetching categories and brands
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useGetCategoriesQuery({})

  const {
    data: brandsData,
    isLoading: brandsLoading,
    error: brandsError,
  } = useGetBrandsQuery()

  const categories = categoriesData?.categories || []
  const brands = brandsData?.brands || []
  const isLoading = categoriesLoading || brandsLoading

  if (categoriesError) {
    console.error("Error fetching categories:", categoriesError)
  }
  if (brandsError) {
    console.error("Error fetching brands:", brandsError)
  }

  useEffect(() => {
    // Initialize filters from URL params
    const category = searchParams.get("category")
    if (category) {
      setSelectedCategories([category])
    }

    const brand = searchParams.get("brand")
    if (brand) {
      setSelectedBrands([brand])
    }

    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    if (minPrice && maxPrice) {
      setPriceRange([Number.parseInt(minPrice), Number.parseInt(maxPrice)])
    }

    const sale = searchParams.get("onSale")
    if (sale === "true") {
      setOnSale(true)
    }
  }, [searchParams])

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())

    // Clear existing filter params
    params.delete("category")
    params.delete("brand")
    params.delete("minPrice")
    params.delete("maxPrice")
    params.delete("onSale")

    // Add selected categories
    if (selectedCategories.length === 1) {
      params.set("category", selectedCategories[0])
    }

    // Add selected brands
    if (selectedBrands.length > 0) {
      selectedBrands.forEach((brand) => {
        params.append("brand", brand)
      })
    }

    // Add price range
    if (priceRange[0] > 0 || priceRange[1] < 20000) {
      params.set("minPrice", priceRange[0].toString())
      params.set("maxPrice", priceRange[1].toString())
    }

    // Add sale filter
    if (onSale) {
      params.set("onSale", "true")
    }

    router.push(`/products?${params.toString()}`)
  }, [router, searchParams, selectedCategories, selectedBrands, priceRange, onSale])

  const clearFilters = useCallback(() => {
    setPriceRange([0, 20000])
    setSelectedCategories([])
    setSelectedBrands([])
    setOnSale(false)
    router.push("/products")
  }, [router])

  const handleCategoryChange = useCallback((categoryId: string) => {
    setSelectedCategories((prev) => (prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [categoryId]))
  }, [])

  const handleBrandChange = useCallback((brandId: string) => {
    setSelectedBrands((prev) => (prev.includes(brandId) ? prev.filter((id) => id !== brandId) : [...prev, brandId]))
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="mb-4 text-lg font-medium">Filters</h3>
          <Skeleton className="h-9 w-full" />
        </div>

        <Accordion type="multiple" defaultValue={["categories", "price", "brands", "other"]}>
          <AccordionItem value="categories">
            <AccordionTrigger>Categories</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="price">
            <AccordionTrigger>Price Range</AccordionTrigger>
            <AccordionContent>
              <Skeleton className="h-8 w-full" />
              <div className="mt-4 flex items-center justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="brands">
            <AccordionTrigger>Brands</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Skeleton className="h-9 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Filters</h3>
        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
          Reset All
        </Button>
      </div>

      <Accordion type="multiple" defaultValue={["categories", "price", "brands", "other"]} className="w-full">
        <AccordionItem value="categories" className="border-b">
          <AccordionTrigger className="py-3 text-sm font-medium hover:no-underline">
            Categories
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="space-y-3">
              {categories.map((category) => (
                <div key={category._id} className="flex items-center space-x-3">
                  <Checkbox
                    id={`category-${category._id}`}
                    checked={selectedCategories.includes(category._id)}
                    onCheckedChange={() => handleCategoryChange(category._id)}
                    className="h-4 w-4"
                  />
                  <label
                    htmlFor={`category-${category._id}`}
                    className="text-sm leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {category.name}
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="price" className="border-b">
          <AccordionTrigger className="py-3 text-sm font-medium hover:no-underline">
            Price Range
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="space-y-4">
              <Slider 
                value={priceRange} 
                min={0} 
                max={20000} 
                step={100} 
                onValueChange={setPriceRange}
                className="w-full"
              />
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Rs. {priceRange[0].toLocaleString()}</span>
                <span className="font-medium">Rs. {priceRange[1].toLocaleString()}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="brands" className="border-b">
          <AccordionTrigger className="py-3 text-sm font-medium hover:no-underline">
            Brands
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="space-y-3">
              {brands.map((brand) => (
                <div key={brand._id} className="flex items-center space-x-3">
                  <Checkbox
                    id={`brand-${brand._id}`}
                    checked={selectedBrands.includes(brand._id)}
                    onCheckedChange={() => handleBrandChange(brand._id)}
                    className="h-4 w-4"
                  />
                  <label
                    htmlFor={`brand-${brand._id}`}
                    className="text-sm leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {brand.name}
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="other" className="border-b">
          <AccordionTrigger className="py-3 text-sm font-medium hover:no-underline">
            Other Filters
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Checkbox 
                  id="on-sale" 
                  checked={onSale} 
                  onCheckedChange={(checked) => setOnSale(checked as boolean)}
                  className="h-4 w-4"
                />
                <label
                  htmlFor="on-sale"
                  className="text-sm leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  On Sale
                </label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="pt-4 border-t">
        <Button onClick={applyFilters} className="w-full h-10">
          Apply Filters
        </Button>
      </div>
    </div>
  )
};

export default ProductFilters;
