import type React from "react"
import type { Metadata } from "next"

import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

import { Geologica, Inter, JetBrains_Mono } from "next/font/google"

import { ThemeProvider } from "@/components/theme-provider"

// Шрифты дизайн-системы — см. DESIGN.md §4
const _geologica = Geologica({
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600"],
  variable: "--font-geologica",
})

const _inter = Inter({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500"],
  variable: "--font-inter",
})

const _jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600"],
  variable: "--font-jetbrains-mono",
})

export const metadata: Metadata = {
  title: "StudySinc",
  description: "Student platform",
  generator: "StudySinc",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${_inter.variable} ${_geologica.variable} ${_jetbrainsMono.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
