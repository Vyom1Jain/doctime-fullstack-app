import React from 'react'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'

const ProfileSettingsPage = () => {
  const { user, logout } = useAuth()
  const { i18n, t } = useTranslation()

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
    localStorage.setItem('language', lng)
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 pt-4 pb-20 space-y-4">
      <header className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary text-xl">
          {user.name?.[0] || 'U'}
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900">{user.name}</h1>
          <p className="text-sm text-slate-500">{user.email}</p>
        </div>
      </header>
      <main className="space-y-4">
        <section className="card space-y-2">
          <h2 className="text-sm font-semibold text-slate-900">{t('profile.language')}</h2>
          <div className="flex gap-3 text-sm">
            <button
              onClick={() => changeLanguage('en')}
              className={`px-3 py-1 rounded-full border ${i18n.language === 'en' ? 'border-primary text-primary bg-primary-50' : 'border-slate-200 text-slate-700'}`}
            >
              English
            </button>
            <button
              onClick={() => changeLanguage('hi')}
              className={`px-3 py-1 rounded-full border ${i18n.language === 'hi' ? 'border-primary text-primary bg-primary-50' : 'border-slate-200 text-slate-700'}`}
            >
              हिंदी
            </button>
          </div>
        </section>

        <section className="card">
          <button
            onClick={logout}
            className="w-full text-sm text-red-600 font-semibold text-left"
          >
            {t('profile.logout')}
          </button>
        </section>
      </main>
    </div>
  )
}

export default ProfileSettingsPage
