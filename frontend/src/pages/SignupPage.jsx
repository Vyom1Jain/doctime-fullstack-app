import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'

const SignupPage = () => {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { signup } = useAuth()
  const { t } = useTranslation()
  const [role, setRole] = useState(state?.role || 'PATIENT')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: ''
    }
  })

  const onSubmit = async (data) => {
    try {
      const user = await signup({ ...data, role })
      if (user.role === 'PATIENT') {
        navigate('/patient/dashboard')
      } else {
        navigate('/doctor/dashboard')
      }
    } catch (e) {
      alert('Signup failed. Email might already be registered.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full space-y-6 bg-white rounded-2xl shadow-md p-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-slate-900">{t('auth.signup')}</h1>
          <p className="text-sm text-slate-500">{t('auth.chooseRole')}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <button
            type="button"
            onClick={() => setRole('PATIENT')}
            className={`border rounded-xl py-3 px-2 flex flex-col items-center gap-1 ${role === 'PATIENT' ? 'border-primary bg-primary-50 text-primary' : 'border-slate-200 text-slate-700'}`}
          >
            🧍
            <span>{t('auth.patient')}</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('DOCTOR')}
            className={`border rounded-xl py-3 px-2 flex flex-col items-center gap-1 ${role === 'DOCTOR' ? 'border-primary bg-primary-50 text-primary' : 'border-slate-200 text-slate-700'}`}
          >
            🩺
            <span>{t('auth.doctor')}</span>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Name</label>
            <input className="input-field" {...register('name', { required: true })} />
            {errors.name && <p className="text-xs text-red-500">Name is required</p>}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">{t('auth.email')}</label>
            <input type="email" className="input-field" {...register('email', { required: true })} />
            {errors.email && <p className="text-xs text-red-500">Email is required</p>}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Phone</label>
            <input className="input-field" {...register('phone')} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">{t('auth.password')}</label>
            <input type="password" className="input-field" {...register('password', { required: true, minLength: 6 })} />
            {errors.password && <p className="text-xs text-red-500">Password must be at least 6 characters</p>}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {isSubmitting ? 'Creating account…' : t('auth.signup')}
          </button>
        </form>
      </div>
    </div>
  )
}

export default SignupPage
