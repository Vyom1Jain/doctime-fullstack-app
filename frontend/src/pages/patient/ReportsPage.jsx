import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'

const ReportsPage = () => {
  const { user } = useAuth()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get(`/api/reports/patient/${user.userId}`)
        setReports(res.data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchReports()
  }, [user.userId])

  const handleTranslate = async (id, lang) => {
    try {
      const res = await axios.post(`/api/reports/${id}/translate?language=${lang}`)
      setReports((prev) => prev.map(r => (r.id === id ? res.data : r)))
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 pt-4 pb-20 space-y-4">
      <header>
        <h1 className="text-xl font-bold text-slate-900">My reports</h1>
        <p className="text-sm text-slate-500">View and translate your uploaded reports.</p>
      </header>
      <main className="space-y-3">
        {loading && <p className="text-sm text-slate-500">Loading reports…</p>}
        {!loading && reports.length === 0 && (
          <p className="text-sm text-slate-500">No reports uploaded.</p>
        )}
        {reports.map((r) => (
          <div key={r.id} className="card space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">{r.title}</p>
                <p className="text-xs text-slate-500">{r.type}</p>
              </div>
              <button
                onClick={() => handleTranslate(r.id, 'hi')}
                className="text-xs text-primary font-medium"
              >
                Translate to Hindi
              </button>
            </div>
            {r.translatedText && (
              <div className="mt-2 p-2 rounded-lg bg-slate-50 text-xs text-slate-700 max-h-40 overflow-y-auto">
                {r.translatedText}
              </div>
            )}
          </div>
        ))}
      </main>
    </div>
  )
}

export default ReportsPage
