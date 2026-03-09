import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

const PatientDashboard = () => {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await axios.get(`/api/appointments/patient/${user.userId}`)
        setAppointments(res.data.slice(0, 3))
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchAppointments()
  }, [user.userId])

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{t('dashboard.welcome')}</p>
          <h1 className="text-xl font-bold text-slate-900">{user.name}</h1>
        </div>
        <button className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary text-lg">
          {user.name?.[0] || 'P'}
        </button>
      </header>

      <main className="px-4 space-y-4">
        <section className="card flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase text-primary">Next appointment</p>
            {loading ? (
              <p className="text-sm text-slate-500 mt-1">Loading…</p>
            ) : appointments[0] ? (
              <div className="mt-1">
                <p className="text-sm font-semibold text-slate-900">
                  With Dr. {appointments[0].doctor?.user?.name || 'Your doctor'}
                </p>
                <p className="text-xs text-slate-500">
                  {new Date(appointments[0].appointmentDateTime).toLocaleString()}
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-500 mt-1">No upcoming appointments</p>
            )}
          </div>
          {appointments[0] && (
            <Link
              to={`/video/${appointments[0].id}`}
              className="btn-secondary text-xs px-3 py-2"
            >
              {t('video.join')}
            </Link>
          )}
        </section>

        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Find a doctor</h2>
            <Link to="/patient/find-doctor" className="text-xs text-primary">See all</Link>
          </div>
          <Link to="/patient/find-doctor" className="block card">
            <p className="text-sm text-slate-600">Search by speciality, disease or doctor name.</p>
          </Link>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-900">Quick actions</h2>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <Link to="/appointments" className="card flex flex-col items-center gap-2 py-4">
              <span>📅</span>
              <span>{t('dashboard.appointments')}</span>
            </Link>
            <Link to="/patient/reports" className="card flex flex-col items-center gap-2 py-4">
              <span>📄</span>
              <span>Reports</span>
            </Link>
            <Link to="/patient/billing" className="card flex flex-col items-center gap-2 py-4">
              <span>💳</span>
              <span>Billing</span>
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}

export default PatientDashboard
