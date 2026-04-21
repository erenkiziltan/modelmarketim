import { useTranslations } from 'next-intl'

export default function Footer() {
  const t = useTranslations('footer')
  const year = new Date().getFullYear()

  return (
    <footer className="bg-zinc-900 text-zinc-400 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Model<span className="text-orange-500">marketim</span>
              </span>
            </div>
            <p className="text-sm text-zinc-500 max-w-xs leading-relaxed">
              El yapımı, özel tasarım 3D baskı figürler. Her biri benzersiz.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600 mb-1">Bağlantılar</p>
            <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">Ürünler</a>
            <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">Hakkımızda</a>
            <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">{t('contact')}</a>
          </div>
        </div>

        <div className="border-t border-zinc-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-zinc-600">© {year} Modelmarketim. {t('rights')}</p>
          <p className="text-xs text-zinc-700">3D Figür E-Ticaret</p>
        </div>
      </div>
    </footer>
  )
}
