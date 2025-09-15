"use client"

import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import BrandForm from "@/components/admin/brand-form"

export default function NewBrandPage() {
  const router = useRouter()
  const { toast } = useToast()

  return (
    <div className="space-y-6 p-4 md:p-8 pt-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Add New Brand</h2>
        <p className="text-muted-foreground">Create a new product brand</p>
      </div>
      <BrandForm />
    </div>
  )
}
