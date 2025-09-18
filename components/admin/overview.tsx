"use client"

import React, { useEffect, useState, useCallback } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"

interface OverviewProps {
  showDetailed?: boolean
}

export const Overview = React.memo(function Overview({ showDetailed = false }: OverviewProps) {
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/analytics?detailed=${showDetailed}`)
      const result = await response.json()
      setData(result.data)
    } catch (error) {
      console.error("Failed to fetch analytics data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [showDetailed])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (isLoading) {
    return <Skeleton className="h-[350px] w-full" />
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `रू${value}`}
        />
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <Tooltip formatter={(value) => [`रू${value}`, ""]} labelFormatter={(label) => `${label}`} />
        {showDetailed ? (
          <>
            <Legend />
            <Bar dataKey="revenue" name="Revenue" fill="#adfa1d" radius={[4, 4, 0, 0]} />
            <Bar dataKey="orders" name="Orders" fill="#2563eb" radius={[4, 4, 0, 0]} />
            <Bar dataKey="customers" name="Customers" fill="#f97316" radius={[4, 4, 0, 0]} />
          </>
        ) : (
          <Bar dataKey="total" fill="#adfa1d" radius={[4, 4, 0, 0]} />
        )}
      </BarChart>
    </ResponsiveContainer>
  )
});
