'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'

const sortOptions = [
  { value: '', label: 'En Yeni' },
  { value: 'price_asc', label: 'Fiyat: Düşükten Yükseğe' },
  { value: 'price_desc', label: 'Fiyat: Yüksekten Düşüğe' },
]

export default function ProductFilters({
  currentSort,
  currentQ,
}: {
  currentSort?: string
  currentQ?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState(currentQ ?? '')

  function updateParams(params: Record<string, string>) {
    const sp = new URLSearchParams()
    if (params.q) sp.set('q', params.q)
    if (params.sort) sp.set('sort', params.sort)
    startTransition(() => {
      router.push(`${pathname}?${sp.toString()}`)
    })
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    updateParams({ q: search, sort: currentSort ?? '' })
  }

  function handleSort(sort: string) {
    updateParams({ q: currentQ ?? '', sort })
  }

  function clearSearch() {
    setSearch('')
    updateParams({ sort: currentSort ?? '' })
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
      {/* Search */}
      <form onSubmit={handleSearch} className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Ürün ara..."
          className="w-full pl-9 pr-9 py-2.5 text-sm bg-white border border-zinc-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
        />
        {search && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {/* Sort */}
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-zinc-400" />
        <div className="flex gap-1.5 flex-wrap">
          {sortOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => handleSort(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                (currentSort ?? '') === opt.value
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
