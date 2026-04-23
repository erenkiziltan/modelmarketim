import { useTranslations } from 'next-intl'
import Link from 'next/link'

export default function Footer({ locale }: { locale: string }) {
  const t = useTranslations('footer')
  const year = new Date().getFullYear()

  return (
    <footer className="bg-slate-900 text-slate-400 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Model<span className="text-indigo-400">marketim</span>
              </span>
            </div>
            <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
              {t('tagline')}
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-600 mb-1">{t('links')}</p>
            <Link href={`/${locale}/products`} className="text-sm text-slate-400 hover:text-indigo-400 transition-colors">
              {t('products')}
            </Link>
            <Link href={`/${locale}/track`} className="text-sm text-slate-400 hover:text-indigo-400 transition-colors">
              {t('track')}
            </Link>
            <a
              href="https://wa.me/905374826673"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-slate-400 hover:text-indigo-400 transition-colors"
            >
              {t('contact')}
            </a>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-slate-600">© {year} Modelmarketim. {t('rights')}</p>
          <p className="text-xs text-slate-700">3D Figür E-Ticaret</p>
        </div>
      </div>
    </footer>
  )
}
