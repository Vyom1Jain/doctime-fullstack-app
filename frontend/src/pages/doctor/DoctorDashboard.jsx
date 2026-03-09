import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

const DoctorDashboard = () => {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await axios.get(`/api/appointments/doctor/${user.userId}`)
        setAppointments(res.data.slice(0, 5))
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
          <h1 className="text-xl font-bold text-slate-900">Dr. {user.name}</h1>
        </div>
        <button className="h-10 w-10 rounded-full bg-secondary-100 flex items-center justify-center text-secondary text-lg">
          {user.name?.[0] || 'D'}
        </button>
      </header>

      <main className="px-4 space-y-4">
        <section className="grid grid-cols-2 gap-3">
          <div className="card space-y-1">
            <p className="text-xs text-slate-500 font-medium uppercase">Today's appointments</p>
            <p className="text-2xl font-bold text-slate-900">{appointments.length}</p>
          </div>
          <Link to="/doctor/earnings" className="card space-y-1">
            <p className="text-xs text-slate-500 font-medium uppercase">Earnings</p>
            <p className="text-2xl font-bold text-slate-900">₹ --</p>
            <p className="text-xs text-slate-400">Connect billing API to show data.</p>
          </Link>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-900">Upcoming appointments</h2>
          <div className="space-y-2">
            {loading && <p className="text-sm text-slate-500">Loading…</p>}
            {!loading && appointments.length === 0 && (
              <p className="text-sm text-slate-500">No appointments scheduled.</p>
            )}
            {appointments.map((appt) => (
              <div key={appt.id} className="card flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-slate-900">{appt.patient?.user?.name || 'Patient'}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(appt.appointmentDateTime).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs rounded-full bg-primary-50 text-primary px-2 py-0.5">
                    {appt.type}
                  </span>
                  <Link to={`/video/${appt.id}`} className="text-xs text-secondary font-medium">
                    {t('video.join')}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default DoctorDashboard
