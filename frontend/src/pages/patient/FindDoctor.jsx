import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useTranslation } from 'react-i18next'

const FindDoctor = () => {
  const { t } = useTranslation()
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get('/api/doctors')
        setDoctors(res.data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchDoctors()
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 pb-20 px-4 pt-4 space-y-4">
      <header>
        <h1 className="text-xl font-bold text-slate-900">{t('appointments.find')}</h1>
        <p className="text-sm text-slate-500">Search doctors by speciality, experience and fee.</p>
      </header>
      <div>
        <input
          className="input-field"
          placeholder="Search (UI only – add filters later)"
        />
      </div>
      <main className="space-y-3">
        {loading && <p className="text-sm text-slate-500">Loading doctors…</p>}
        {!loading && doctors.length === 0 && (
          <p className="text-sm text-slate-500">No doctors found.</p>
        )}
        {doctors.map((doc) => (
          <div key={doc.id} className="card flex gap-3">
            <div className="h-14 w-14 rounded-full bg-primary-100 flex items-center justify-center text-primary text-lg">
              {doc.user?.name?.[0] || 'D'}
            </div>
            <div className="flex-1 text-sm">
              <p className="font-semibold text-slate-900">Dr. {doc.user?.name}</p>
              <p className="text-xs text-slate-500">{doc.specialty}</p>
              <p className="text-xs text-slate-500 mt-1">
                {doc.experienceYears} yrs exp • ₹ {doc.consultationFee}
              </p>
            </div>
          </div>
        ))}
      </main>
    </div>
  )
}

export default FindDoctor
