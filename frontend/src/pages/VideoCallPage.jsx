import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'
import { createClient, createMicrophoneAndCameraTracks } from 'agora-rtc-react'

const VideoCallPage = () => {
  const { appointmentId } = useParams()
  const { user } = useAuth()
  const { t } = useTranslation()
  const [tokenData, setTokenData] = useState(null)
  const [notes, setNotes] = useState('')

  const appId = import.meta.env.VITE_AGORA_APP_ID

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const channelName = `appt_${appointmentId}`
        const res = await axios.post('/api/video/token', { channelName, appointmentId: Number(appointmentId), uid: 0 })
        setTokenData(res.data)
      } catch (e) {
        console.error(e)
      }
    }
    fetchToken()
  }, [appointmentId])

  // For brevity, not wiring full Agora UI; placeholder layout:
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <header className="px-4 py-3 flex items-center justify-between bg-slate-950/60">
        <div>
          <p className="text-xs text-slate-300">Video consultation</p>
          <p className="text-sm font-semibold">Appointment #{appointmentId}</p>
        </div>
        <button className="text-xs bg-red-500 px-3 py-1 rounded-full">End</button>
      </header>
      <main className="flex-1 grid md:grid-cols-[2fr,1fr]">
        <div className="flex items-center justify-center bg-slate-800">
          <p className="text-sm text-slate-300">
            Video layout goes here (wire Agora once credentials are set).
          </p>
        </div>
        <aside className="bg-slate-950/60 p-4 flex flex-col">
          <h2 className="text-sm font-semibold mb-2">{t('video.notes')}</h2>
          <textarea
            className="flex-1 rounded-lg bg-slate-900 border border-slate-700 p-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Write notes here during the call…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <p className="text-[11px] text-slate-500 mt-2">
            (Auto-save endpoint for video notes can be wired later.)
          </p>
        </aside>
      </main>
    </div>
  )
}

export default VideoCallPage
