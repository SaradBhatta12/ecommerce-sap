"use client"

import { useEffect, useRef } from "react"

interface QRCodeProps {
  value: string
  size?: number
  bgColor?: string
  fgColor?: string
  level?: "L" | "M" | "Q" | "H"
}

export function QRCode({ value, size = 128, bgColor = "#ffffff", fgColor = "#000000", level = "M" }: QRCodeProps) {
  const qrRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && qrRef.current) {
      import("qrcode").then((QRCode) => {
        QRCode.toCanvas(
          qrRef.current,
          value,
          {
            width: size,
            margin: 1,
            color: {
              dark: fgColor,
              light: bgColor,
            },
            errorCorrectionLevel: level,
          },
          (error) => {
            if (error) console.error("Error generating QR code:", error)
          },
        )
      })
    }
  }, [value, size, bgColor, fgColor, level])

  return <div ref={qrRef} className="inline-block" />
}
