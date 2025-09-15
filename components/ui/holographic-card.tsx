"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface HolographicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  intensity?: number
  children: React.ReactNode
  glowColor?: string
  backgroundColor?: string
  borderRadius?: string
  holographicEffect?: boolean
  floatingEffect?: boolean
  pulseEffect?: boolean
}

export function HolographicCard({
  intensity = 0.2,
  children,
  className,
  glowColor = "rgba(120, 85, 245, 0.7)",
  backgroundColor = "rgba(17, 17, 23, 0.8)",
  borderRadius = "1.5rem",
  holographicEffect = true,
  floatingEffect = false,
  pulseEffect = false,
  ...props
}: HolographicCardProps) {
  const [{ rotateX, rotateY, scale }, setTransform] = useState({ rotateX: 0, rotateY: 0, scale: 1 })
  const [glowing, setGlowing] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!holographicEffect || !cardRef.current) return

    const card = cardRef.current
    const rect = card.getBoundingClientRect()
    const cardCenterX = rect.left + rect.width / 2
    const cardCenterY = rect.top + rect.height / 2
    const mouseX = e.clientX
    const mouseY = e.clientY

    // Calculate rotation based on mouse position relative to card center
    const rotateY = ((mouseX - cardCenterX) / (rect.width / 2)) * intensity * 10
    const rotateX = -((mouseY - cardCenterY) / (rect.height / 2)) * intensity * 10

    setTransform({ rotateX, rotateY, scale: 1.03 })
    setGlowing(true)
  }

  const handleMouseLeave = () => {
    setTransform({ rotateX: 0, rotateY: 0, scale: 1 })
    setGlowing(false)
  }

  // Floating animation effect
  useEffect(() => {
    if (!floatingEffect) return

    let animationFrameId: number
    let angle = 0

    const animate = () => {
      angle += 0.01
      const translateY = Math.sin(angle) * 5

      if (cardRef.current) {
        cardRef.current.style.transform = `translateY(${translateY}px) 
          rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [floatingEffect, rotateX, rotateY, scale])

  return (
    <div
      ref={cardRef}
      className={cn("relative transition-transform duration-200 ease-out", className)}
      style={{
        borderRadius,
        backgroundColor,
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`,
        boxShadow: glowing ? `0 0 30px ${glowColor}, inset 0 0 10px rgba(255, 255, 255, 0.5)` : "none",
        transition: "transform 0.2s ease-out, box-shadow 0.3s ease-out",
        animation: pulseEffect ? "pulse 2s infinite" : "none",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      <div className="relative z-10">{children}</div>
      {glowing && (
        <div
          className="absolute inset-0 opacity-70 pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, ${glowColor} 0%, transparent 70%)`,
            borderRadius,
            mixBlendMode: "screen",
          }}
        />
      )}
    </div>
  )
}
