import React from 'react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'

const LoginPage = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()
  const { login } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const onSubmit = async (data) => {
    try {
      const user = await login(data.email, data.password)
      if (user.role === 'PATIENT') {
        navigate('/patient/dashboard')
      } else if (user.role === 'DOCTOR') {
        navigate('/doctor/dashboard')
      } else {
        navigate('/')
      }
    } catch (e) {
      alert('Login failed. Please check your credentials.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white rounded-2xl shadow-md p-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-slate-900">{t('auth.welcome')}</h1>
          <p className="text-sm text-slate-500">{t('app.tagline')}</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">{t('auth.email')}</label>
            <input
              type="email"
              className="input-field"
              {...register('email', { required: true })}
            />
            {errors.email && <p className="text-xs text-red-500">Email is required</p>}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">{t('auth.password')}</label>
            <input
              type="password"
              className="input-field"
              {...register('password', { required: true })}
            />
            {errors.password && <p className="text-xs text-red-500">Password is required</p>}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {isSubmitting ? 'Signing in…' : t('auth.login')}
          </button>
        </form>
        <div className="flex justify-between text-xs text-slate-500">
          <button className="hover:text-primary">{t('auth.forgot')}</button>
          <button onClick={() => navigate('/signup')} className="hover:text-primary">
            {t('auth.signup')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
