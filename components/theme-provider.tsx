"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"
import { useTheme } from "next-themes"
import { toast } from "sonner"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

export function useThemeWithToast() {
  const { theme, setTheme } = useTheme()


  const toggleTheme = React.useCallback(() => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    toast.success(`Theme Changed`, {
      description: `Switched to ${newTheme} mode`,
    })
  }, [theme, setTheme])

  return { theme, setTheme, toggleTheme }
}
