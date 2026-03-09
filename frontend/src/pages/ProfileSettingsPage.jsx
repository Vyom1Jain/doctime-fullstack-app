import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import axios from 'axios'
import { useTranslation } from 'react-i18next'
import {
  User, Mail, Phone, MapPin, Stethoscope, DollarSign,
  Lock, Globe, LogOut, Camera, CheckCircle, AlertCircle, Loader2
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import BottomNav from '../components/BottomNav'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  address: z.string().optional(),
  specialty: z.string().optional(),
  bio: z.string().optional(),
  consultationFee: z.coerce.number().min(0).optional(),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

function Toast({ type, message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white text-sm
      ${type === 'success' ? 'bg-secondary' : 'bg-red-500'}`}>
      {type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {message}
    </div>
  )
}

export default function ProfileSettingsPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const [toast, setToast] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [activeSection, setActiveSection] = useState('profile')

  const showToast = (type, message) => setToast({ type, message })

  const {
    register: regProfile,
    handleSubmit: handleProfile,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      address: user?.address || '',
      specialty: user?.specialty || '',
      bio: user?.bio || '',
      consultationFee: user?.consultationFee || '',
    },
  })

  useEffect(() => {
    if (user) {
      resetProfile({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        specialty: user.specialty || '',
        bio: user.bio || '',
        consultationFee: user.consultationFee || '',
      })
    }
  }, [user, resetProfile])

  const {
    register: regPassword,
    handleSubmit: handlePassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm({ resolver: zodResolver(passwordSchema) })

  const onSaveProfile = async (data) => {
    setProfileLoading(true)
    try {
      await axios.put('/api/profile', data)
      showToast('success', 'Profile updated successfully')
    } catch {
      showToast('error', 'Failed to update profile')
    } finally {
      setProfileLoading(false)
    }
  }

  const onChangePassword = async (data) => {
    setPasswordLoading(true)
    try {
      await axios.put('/api/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
      showToast('success', 'Password changed successfully')
      resetPassword()
    } catch {
      showToast('error', 'Failed to change password. Check your current password.')
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang)
    localStorage.setItem('language', lang)
    showToast('success', `Language changed to ${lang === 'en' ? 'English' : 'Hindi'}`)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  const sections = [
    { id: 'profile', label: t('profile.edit'), icon: User },
    { id: 'password', label: 'Change Password', icon: Lock },
    { id: 'language', label: t('profile.language'), icon: Globe },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('profile.settings')}</h1>

            {/* Profile Header */}
            <div className="card mb-6 flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold">
                  {initials}
                </div>
                <button
                  className="absolute bottom-0 right-0 w-7 h-7 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow hover:bg-gray-50"
                  title="Change photo (placeholder)"
                >
                  <Camera className="w-3.5 h-3.5 text-gray-600" />
                </button>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">{user?.name}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium
                  ${user?.role === 'DOCTOR' ? 'bg-primary-100 text-primary-700' : 'bg-secondary-100 text-secondary-700'}`}>
                  {user?.role}
                </span>
              </div>
            </div>

            {/* Section Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200">
              {sections.map(s => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors
                    ${activeSection === s.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                  <s.icon className="w-4 h-4" />
                  {s.label}
                </button>
              ))}
            </div>

            {/* Profile Section */}
            {activeSection === 'profile' && (
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('profile.edit')}</h2>
                <form onSubmit={handleProfile(onSaveProfile)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <User className="inline w-4 h-4 mr-1" />Full Name
                    </label>
                    <input {...regProfile('name')} className="input-field" placeholder="Your full name" />
                    {profileErrors.name && (
                      <p className="text-red-500 text-xs mt-1">{profileErrors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Mail className="inline w-4 h-4 mr-1" />Email
                    </label>
                    <input
                      value={user?.email || ''}
                      readOnly
                      className="input-field bg-gray-50 cursor-not-allowed text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Phone className="inline w-4 h-4 mr-1" />Phone
                    </label>
                    <input {...regProfile('phone')} className="input-field" placeholder="+1 (555) 000-0000" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <MapPin className="inline w-4 h-4 mr-1" />Address
                    </label>
                    <input {...regProfile('address')} className="input-field" placeholder="Your address" />
                  </div>

                  {user?.role === 'DOCTOR' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <Stethoscope className="inline w-4 h-4 mr-1" />Specialty
                        </label>
                        <input {...regProfile('specialty')} className="input-field" placeholder="e.g. Cardiologist" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                        <textarea
                          {...regProfile('bio')}
                          rows={3}
                          className="input-field resize-none"
                          placeholder="Brief professional bio..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <DollarSign className="inline w-4 h-4 mr-1" />Consultation Fee ($)
                        </label>
                        <input
                          type="number"
                          min="0"
                          {...regProfile('consultationFee')}
                          className="input-field"
                          placeholder="100"
                        />
                      </div>
                    </>
                  )}

                  <button type="submit" className="btn-primary w-full" disabled={profileLoading}>
                    {profileLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />Saving...
                      </span>
                    ) : 'Save Changes'}
                  </button>
                </form>
              </div>
            )}

            {/* Password Section */}
            {activeSection === 'password' && (
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>
                <form onSubmit={handlePassword(onChangePassword)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <input
                      type="password"
                      {...regPassword('currentPassword')}
                      className="input-field"
                      placeholder="Enter current password"
                    />
                    {passwordErrors.currentPassword && (
                      <p className="text-red-500 text-xs mt-1">{passwordErrors.currentPassword.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <input
                      type="password"
                      {...regPassword('newPassword')}
                      className="input-field"
                      placeholder="Min. 8 characters"
                    />
                    {passwordErrors.newPassword && (
                      <p className="text-red-500 text-xs mt-1">{passwordErrors.newPassword.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      {...regPassword('confirmPassword')}
                      className="input-field"
                      placeholder="Repeat new password"
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">{passwordErrors.confirmPassword.message}</p>
                    )}
                  </div>

                  <button type="submit" className="btn-primary w-full" disabled={passwordLoading}>
                    {passwordLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />Updating...
                      </span>
                    ) : 'Change Password'}
                  </button>
                </form>
              </div>
            )}

            {/* Language Section */}
            {activeSection === 'language' && (
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('profile.language')}</h2>
                <p className="text-sm text-gray-500 mb-4">Choose your preferred language for the app interface.</p>
                <div className="space-y-3">
                  {[
                    { code: 'en', label: 'English', native: 'English' },
                    { code: 'hi', label: 'Hindi', native: 'हिंदी' },
                  ].map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-colors
                        ${i18n.language === lang.code
                          ? 'border-primary bg-primary-50 text-primary'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}
                    >
                      <span className="font-medium">{lang.label}</span>
                      <span className="text-sm">{lang.native}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Logout */}
            <div className="mt-6">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
              >
                <LogOut className="w-4 h-4" />
                {t('profile.logout')}
              </button>
            </div>
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
