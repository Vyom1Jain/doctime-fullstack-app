import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Stethoscope, User, Clock, ArrowRight } from 'lucide-react'

const RoleCard = ({ icon: Icon, title, description, accentColor, onClick }) => (
  <button
    onClick={onClick}
    className="group relative w-full bg-white rounded-2xl shadow-lg p-8 text-left transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-white/50"
  >
    <div
      className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5 transition-transform duration-300 group-hover:scale-110 ${accentColor}`}
    >
      <Icon size={32} className="text-white" />
    </div>

    <h2 className="text-xl font-bold text-gray-800 mb-2">{title}</h2>
    <p className="text-gray-500 text-sm leading-relaxed mb-6">{description}</p>

    <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary group-hover:gap-3 transition-all duration-200">
      Get Started <ArrowRight size={16} />
    </span>
  </button>
)

export default function RoleSelectionPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-blue-500 to-blue-700 flex flex-col items-center justify-center px-4 py-12">
      {/* Logo / Brand */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl mb-4 shadow-lg">
          <Clock size={40} className="text-white" />
        </div>
        <h1 className="text-4xl font-extrabold text-white tracking-tight">
          {t('app.name')}
        </h1>
        <p className="mt-2 text-blue-100 text-base">{t('app.tagline')}</p>
      </div>

      {/* Role prompt */}
      <p className="text-white/90 text-lg font-medium mb-8 text-center">
        {t('auth.chooseRole')}
      </p>

      {/* Role cards */}
      <div className="w-full max-w-md flex flex-col gap-5 sm:flex-row sm:max-w-2xl">
        <div className="flex-1">
          <RoleCard
            icon={Stethoscope}
            title={t('auth.doctor')}
            description="Manage your schedule, consult patients remotely, and grow your practice."
            accentColor="bg-primary"
            onClick={() => navigate('/login?role=DOCTOR')}
          />
        </div>
        <div className="flex-1">
          <RoleCard
            icon={User}
            title={t('auth.patient')}
            description="Find doctors, book appointments, and manage your health — all in one place."
            accentColor="bg-secondary"
            onClick={() => navigate('/login?role=PATIENT')}
          />
        </div>
      </div>

      {/* Already have an account */}
      <p className="mt-10 text-blue-100 text-sm">
        Already have an account?{' '}
        <Link
          to="/login"
          className="text-white font-semibold underline underline-offset-2 hover:text-blue-200 transition-colors"
        >
          {t('auth.login')}
        </Link>
      </p>
    </div>
  )
}
