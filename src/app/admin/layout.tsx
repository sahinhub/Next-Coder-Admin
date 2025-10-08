'use client'

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AuthProvider } from "@/contexts/AuthContext"
import ProtectedRoute from "@/components/ProtectedRoute"
import { useIsMobile } from "@/hooks/use-mobile"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isMobile = useIsMobile()
  
  return (
    <AuthProvider>
      <ProtectedRoute>
        <SidebarProvider defaultOpen={!isMobile}>
          <SidebarInset>
            <div className="flex h-full w-full flex-col">
              {/* Main content area */}
              <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
                <div className="">
                  {children}
                </div>
              </main>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </ProtectedRoute>
    </AuthProvider>
  )
}