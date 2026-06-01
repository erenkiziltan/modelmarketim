'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Package, ShoppingBag, Settings, LogOut, FolderOpen } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/yonetim-paneli/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/yonetim-paneli/products', label: 'Ürünler', icon: Package },
  { href: '/yonetim-paneli/categories', label: 'Kategoriler', icon: FolderOpen },
  { href: '/yonetim-paneli/orders', label: 'Siparişler', icon: ShoppingBag },
  { href: '/yonetim-paneli/settings', label: 'Ayarlar', icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/yonetim-paneli/login')
    router.refresh()
  }

  return (
    <aside className="w-56 min-h-screen flex flex-col" style={{ background: '#102A43' }}>
      {/* Logo */}
      <div className="px-5 py-4 border-b" style={{ borderColor: '#1e3d5c' }}>
        <div className="flex items-center gap-2.5">
          <div className="bg-white rounded-lg p-1 flex items-center justify-center shadow-sm">
            <img
              src="/logo-icon.png"
              alt="Model Marketim"
              className="h-7 w-auto object-contain"
            />
          </div>
          <span className="text-base font-bold text-white">
            Model<span style={{ color: '#C7A06F' }}>marketim</span>
          </span>
        </div>
        <p className="text-xs mt-1" style={{ color: '#C7A06F80' }}>Yönetim Paneli</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map(item => {
          const Icon = item.icon
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'text-white'
                  : 'hover:text-white'
              )}
              style={active
                ? { background: '#C7A06F', color: '#fff' }
                : { color: '#7a9bb8' }
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4" style={{ borderTop: '1px solid #1e3d5c' }}>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full hover:text-white"
          style={{ color: '#7a9bb8' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#1e3d5c')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <LogOut className="h-4 w-4" />
          Çıkış Yap
        </button>
      </div>
    </aside>
  )
}
