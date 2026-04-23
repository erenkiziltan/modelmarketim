import AdminSidebar from '@/components/admin/AdminSidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminSettings() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <div className="flex-1 p-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-slate-900 mb-8">Ayarlar</h1>
        <Card>
          <CardHeader><CardTitle>Genel Ayarlar</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">Ayarlar yakında eklenecek.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
