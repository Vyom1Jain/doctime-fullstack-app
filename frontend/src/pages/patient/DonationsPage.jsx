import React, { useEffect, useState } from 'react'
import axios from 'axios'

const DonationsPage = () => {
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const res = await axios.get('/api/donations/active')
        setDonations(res.data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchDonations()
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 px-4 pt-4 pb-20 space-y-4">
      <header>
        <h1 className="text-xl font-bold text-slate-900">Support patients</h1>
        <p className="text-sm text-slate-500">Browse verified cases and help patients in need.</p>
      </header>
      <main className="space-y-3">
        {loading && <p className="text-sm text-slate-500">Loading cases…</p>}
        {!loading && donations.length === 0 && (
          <p className="text-sm text-slate-500">No active cases right now.</p>
        )}
        {donations.map((d) => (
          <div key={d.id} className="card space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">{d.title}</p>
                <p className="text-xs text-slate-500">Urgency: {d.urgency}</p>
              </div>
              {d.targetAmount && (
                <p className="text-xs text-slate-500 text-right">
                  ₹ {Number(d.raisedAmount || 0).toFixed(0)} / ₹ {Number(d.targetAmount).toFixed(0)}
                </p>
              )}
            </div>
            <p className="text-xs text-slate-600 line-clamp-3">{d.description}</p>
            <button className="btn-secondary w-full text-xs mt-1">Donate (UI only)</button>
          </div>
        ))}
      </main>
    </div>
  )
}

export default DonationsPage
