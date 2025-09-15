"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Brain,
  Package,
  Layers,
  Tag,
  Percent,
  ShoppingCart,
  Users,
  Box,
  Truck,
  Globe,
  Zap,
  MessageSquare,
  Shield,
  Smartphone,
  Database,
  Cpu,
  GitBranch,
  Settings,
} from "lucide-react"

const items = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Analytics & AI",
    href: "/admin/analytics",
    icon: Brain,
  },
  {
    title: "Products",
    href: "/admin/products",
    icon: Package,
  },
  {
    title: "Categories",
    href: "/admin/categories",
    icon: Layers,
  },
  {
    title: "Brands",
    href: "/admin/brands",
    icon: Tag,
  },
  {
    title: "Discounts & Promos",
    href: "/admin/discounts",
    icon: Percent,
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    title: "Customers",
    href: "/admin/customers",
    icon: Users,
  },
  {
    title: "Inventory",
    href: "/admin/inventory",
    icon: Box,
  },
  {
    title: "Logistics & Delivery",
    href: "/admin/logistics",
    icon: Truck,
  },
  {
    title: "AR/VR Experiences",
    href: "/admin/ar-vr",
    icon: Globe,
  },
  {
    title: "Automated Marketing",
    href: "/admin/marketing",
    icon: Zap,
  },
  {
    title: "Customer Support AI",
    href: "/admin/support",
    icon: MessageSquare,
  },
  {
    title: "Security & Compliance",
    href: "/admin/security",
    icon: Shield,
  },
  {
    title: "Mobile App Management",
    href: "/admin/mobile",
    icon: Smartphone,
  },
  {
    title: "Data Management",
    href: "/admin/data",
    icon: Database,
  },
  {
    title: "AI Integration",
    href: "/admin/ai-integration",
    icon: Cpu,
  },
  {
    title: "Workflow Automation",
    href: "/admin/automation",
    icon: GitBranch,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="grid items-start gap-2 overflow-y-auto pr-2 max-h-[calc(100vh-4rem)]">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
            pathname === item.href || pathname.startsWith(`${item.href}/`)
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground",
          )}
        >
          <item.icon className="mr-2 h-4 w-4" />
          <span>{item.title}</span>
        </Link>
      ))}
    </nav>
  )
}

export default AdminNav
