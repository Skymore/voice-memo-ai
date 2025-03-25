"use client"

import { Inter, Playfair_Display } from 'next/font/google'
import "./globals.css"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "@/components/theme-provider"
import { AppSidebar } from "@/components/app-sidebar"
import { Toaster } from "@/components/ui/toaster"
import { ThemeToggle } from "@/components/theme-toggle"
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Script from 'next/script'

// 设置字体 
const inter = Inter({ 
  subsets: ["latin"], 
  display: 'swap',
  variable: '--font-inter',
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-playfair',
})

const queryClient = new QueryClient()

// 注意：(landing)分组有自己的布局，不会使用此布局
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const pathname = usePathname()
  const isHomePage = pathname === '/'

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsAuthenticated(!!token)

    const handleStorageChange = () => {
      const updatedToken = localStorage.getItem('token')
      setIsAuthenticated(!!updatedToken)
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // 首页使用全宽布局，不显示边栏
  if (isHomePage) {
    return (
      <html lang="en" suppressHydrationWarning className={`${inter.variable} ${playfair.variable}`}>
        <head>
          {/* 预加载关键资源 */}
          <link 
            rel="preload" 
            href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Roboto:wght@300;400;500;700&display=swap" 
            as="style"
            crossOrigin="anonymous"
          />
          <link 
            rel="preload" 
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" 
            as="style"
          />
          <link
            rel="stylesheet"
            href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
            integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
            crossOrigin=""
          />
          <link 
            rel="stylesheet" 
            href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Roboto:wght@300;400;500;700&display=swap"
          />
          <link 
            rel="stylesheet" 
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
          />
          {/* 预加载Mermaid脚本 */}
          <Script 
            src="https://cdnjs.cloudflare.com/ajax/libs/mermaid/10.2.3/mermaid.min.js" 
            strategy="beforeInteractive"
          />
        </head>
        <body className={inter.className}>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster />
            </ThemeProvider>
          </QueryClientProvider>
        </body>
      </html>
    )
  }

  // 非首页使用带边栏的布局
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
          integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
          crossOrigin=""
        />
      </head>
      <body className={`${inter.className} flex flex-col h-screen`}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex flex-1">
              <AppSidebar>{null}</AppSidebar>
              <main className="flex-1 overflow-y-auto">
                <div className="container mx-auto p-4">
                  <div className="flex justify-end mb-4">
                    <ThemeToggle />
                  </div>
                  {children}
                </div>
              </main>
            </div>
            <Toaster />
          </ThemeProvider>
        </QueryClientProvider>
      </body>
    </html>
  )
}