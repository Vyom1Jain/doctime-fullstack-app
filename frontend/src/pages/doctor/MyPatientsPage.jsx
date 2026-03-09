import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'

const MyPatientsPage = () => {
  const { user } = useAuth()
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await axios.get(`/api/doctors/${user.userId}/patients`)
        setPatients(res.data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchPatients()
  }, [user.userId])

  return (
    <div className="min-h-screen bg-slate-50 px-4 pt-4 pb-20 space-y-4">
      <header>
        <h1 className="text-xl font-bold text-slate-900">My patients</h1>
        <p className="text-sm text-slate-500">Patients you have consulted with on Doctime.</p>
      </header>
      <main className="space-y-3">
        {loading && <p className="text-sm text-slate-500">Loading patients…</p>}
        {!loading && patients.length === 0 && (
          <p className="text-sm text-slate-500">No patients yet.</p>
        )}
        {patients.map((p) => (
          <div key={p.id} className="card flex items-center gap-3 text-sm">
            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
              {p.user?.name?.[0] || 'P'}
            </div>
            <div>
              <p className="font-semibold text-slate-900">{p.user?.name}</p>
              <p className="text-xs text-slate-500">{p.gender || ''} • {p.bloodGroup || ''}</p>
            </div>
          </div>
        ))}
      </main>
    </div>
  )
}

export default MyPatientsPage
