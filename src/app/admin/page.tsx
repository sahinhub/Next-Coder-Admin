import { Suspense } from 'react'
import AdminLayoutClient from './admin-layout-client'
import { AdminSkeleton } from '@/components/admin/AdminSkeleton'

export default function AdminDashboard() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <AdminLayoutClient />
    </Suspense>
  )
}