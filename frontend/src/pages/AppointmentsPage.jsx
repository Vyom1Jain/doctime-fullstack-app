import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'

const AppointmentsPage = () => {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const base = user.role === 'PATIENT' ? 'patient' : 'doctor'
        const res = await axios.get(`/api/appointments/${base}/${user.userId}`)
        setAppointments(res.data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchAppointments()
  }, [user])

  return (
    <div className="min-h-screen bg-slate-50 px-4 pt-4 pb-20 space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">{t('dashboard.appointments')}</h1>
      </header>
      <main className="space-y-3">
        {loading && <p className="text-sm text-slate-500">Loading appointments…</p>}
        {!loading && appointments.length === 0 && (
          <p className="text-sm text-slate-500">No appointments yet.</p>
        )}
        {appointments.map((appt) => (
          <div key={appt.id} className="card flex items-center justify-between text-sm">
            <div>
              <p className="font-semibold text-slate-900">
                {user.role === 'PATIENT'
                  ? `Dr. ${appt.doctor?.user?.name || ''}`
                  : appt.patient?.user?.name || 'Patient'}
              </p>
              <p className="text-xs text-slate-500">
                {new Date(appt.appointmentDateTime).toLocaleString()}
              </p>
            </div>
            <span className="text-xs rounded-full bg-slate-100 text-slate-700 px-2 py-1">
              {appt.status}
            </span>
          </div>
        ))}
      </main>
    </div>
  )
}

export default AppointmentsPage
