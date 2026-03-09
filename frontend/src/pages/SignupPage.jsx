import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  User,
  Mail,
  Lock,
  Phone,
  Stethoscope,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

/* ─── Zod schema ─────────────────────────────────────────────── */
const baseSchema = z.object({
  name: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(80, 'Full name is too long'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  role: z.enum(['PATIENT', 'DOCTOR'], { required_error: 'Please select a role' }),
  phone: z
    .string()
    .regex(/^\+?[0-9\s\-()]{7,15}$/, 'Invalid phone number')
    .optional()
    .or(z.literal('')),
  specialty: z.string().optional(),
})

const signupSchema = baseSchema
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((d) => d.role !== 'DOCTOR' || (d.specialty && d.specialty.trim().length > 0), {
    message: 'Specialty is required for doctors',
    path: ['specialty'],
  })

/* ─── Password strength helper ───────────────────────────────── */
const passwordRules = [
  { label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { label: 'One uppercase letter', test: (v) => /[A-Z]/.test(v) },
  { label: 'One number', test: (v) => /[0-9]/.test(v) },
]

const PasswordStrength = ({ value = '' }) => (
  <ul className="mt-2 space-y-1">
    {passwordRules.map(({ label, test }) => {
      const passed = test(value)
      return (
        <li key={label} className={`flex items-center gap-1.5 text-xs ${passed ? 'text-secondary' : 'text-gray-400'}`}>
          {passed ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
          {label}
        </li>
      )
    })}
  </ul>
)

/* ─── Reusable field error ───────────────────────────────────── */
const FieldError = ({ message }) =>
  message ? (
    <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
      <AlertCircle size={12} className="shrink-0" />
      {message}
    </p>
  ) : null

/* ─── Page component ─────────────────────────────────────────── */
export default function SignupPage() {
  const { t } = useTranslation()
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const defaultRole = searchParams.get('role') === 'DOCTOR' ? 'DOCTOR' : 'PATIENT'

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [serverError, setServerError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: { role: defaultRole },
  })

  const selectedRole = watch('role')
  const passwordValue = watch('password') ?? ''

  const onSubmit = async (data) => {
    setServerError('')
    setIsSubmitting(true)
    try {
      const payload = {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        ...(data.phone ? { phone: data.phone } : {}),
        ...(data.role === 'DOCTOR' && data.specialty ? { specialty: data.specialty } : {}),
      }
      const userData = await signup(payload)
      if (userData.role === 'DOCTOR') {
        navigate('/doctor/dashboard', { replace: true })
      } else {
        navigate('/patient/dashboard', { replace: true })
      }
    } catch (err) {
      setServerError(
        err?.response?.data?.message || 'Something went wrong. Please try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-blue-500 to-blue-700 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Brand header */}
        <div className="text-center mb-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl mb-3 shadow-md hover:bg-white/30 transition-colors"
          >
            <Clock size={28} className="text-white" />
          </Link>
          <h1 className="text-3xl font-extrabold text-white">{t('app.name')}</h1>
          <p className="mt-1 text-blue-100 text-sm">{t('app.tagline')}</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl px-8 py-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Create an account</h2>
          <p className="text-gray-500 text-sm mb-7">Join {t('app.name')} to get started</p>

          {/* Server error */}
          {serverError && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-5 text-sm">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            {/* Role selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I am a…
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'PATIENT', label: t('auth.patient'), icon: User },
                  { value: 'DOCTOR', label: t('auth.doctor'), icon: Stethoscope },
                ].map(({ value, label, icon: Icon }) => (
                  <label
                    key={value}
                    className={`flex items-center gap-2 border-2 rounded-xl p-3 cursor-pointer transition-all duration-150 ${
                      selectedRole === value
                        ? 'border-primary bg-primary/5 text-primary font-semibold'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <input
                      {...register('role')}
                      type="radio"
                      value={value}
                      className="sr-only"
                    />
                    <Icon size={16} />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
              <FieldError message={errors.role?.message} />
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  {...register('name')}
                  type="text"
                  autoComplete="name"
                  placeholder="Jane Smith"
                  className={`input-field pl-9 ${errors.name ? 'border-red-400 focus:ring-red-400' : ''}`}
                />
              </div>
              <FieldError message={errors.name?.message} />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={`input-field pl-9 ${errors.email ? 'border-red-400 focus:ring-red-400' : ''}`}
                />
              </div>
              <FieldError message={errors.email?.message} />
            </div>

            {/* Phone (optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Phone <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  {...register('phone')}
                  type="tel"
                  autoComplete="tel"
                  placeholder="+91 98765 43210"
                  className={`input-field pl-9 ${errors.phone ? 'border-red-400 focus:ring-red-400' : ''}`}
                />
              </div>
              <FieldError message={errors.phone?.message} />
            </div>

            {/* Specialty (doctor only) */}
            {selectedRole === 'DOCTOR' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Specialty <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Stethoscope size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    {...register('specialty')}
                    type="text"
                    placeholder="e.g. Cardiologist, Dermatologist"
                    className={`input-field pl-9 ${errors.specialty ? 'border-red-400 focus:ring-red-400' : ''}`}
                  />
                </div>
                <FieldError message={errors.specialty?.message} />
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className={`input-field pl-9 pr-10 ${errors.password ? 'border-red-400 focus:ring-red-400' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <FieldError message={errors.password?.message} />
              {passwordValue && <PasswordStrength value={passwordValue} />}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  {...register('confirmPassword')}
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className={`input-field pl-9 pr-10 ${errors.confirmPassword ? 'border-red-400 focus:ring-red-400' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <FieldError message={errors.confirmPassword?.message} />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creating account…
                </>
              ) : (
                t('auth.signup')
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link
              to={defaultRole !== 'PATIENT' ? `/login?role=${defaultRole}` : '/login'}
              className="text-primary font-semibold hover:text-blue-700 transition-colors"
            >
              {t('auth.login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
