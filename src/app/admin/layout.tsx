import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AuthProvider } from "@/contexts/AuthContext"
import ProtectedRoute from "@/components/ProtectedRoute"
import AdminLayoutClient from "./admin-layout-client"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <AdminLayoutClient>
          {children}
        </AdminLayoutClient>
      </ProtectedRoute>
    </AuthProvider>
  )
}