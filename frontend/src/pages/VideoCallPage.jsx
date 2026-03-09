import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Mic, MicOff, Video, VideoOff, PhoneOff, FileText, CheckCircle, AlertCircle,
} from 'lucide-react';
import axios from 'axios';
import AgoraRTC, {
  AgoraRTCProvider,
  useLocalMicrophoneTrack,
  useLocalCameraTrack,
  useJoin,
  usePublish,
  useRemoteUsers,
  RemoteUser,
} from 'agora-rtc-react';
import { useAuth } from '../context/AuthContext';

const APP_ID = import.meta.env.VITE_AGORA_APP_ID;

// Inner component that uses Agora hooks (must be inside AgoraRTCProvider)
function VideoCallUI({ appointment, token, channelName, onEndCall }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { appointmentId } = useParams();
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [callError, setCallError] = useState('');

  const { localMicrophoneTrack, isLoading: micLoading } = useLocalMicrophoneTrack(audioEnabled);
  const { localCameraTrack, isLoading: camLoading } = useLocalCameraTrack(videoEnabled);
  const remoteUsers = useRemoteUsers();

  useJoin({ appid: APP_ID, channel: channelName, token: token || null }, true);
  usePublish([localMicrophoneTrack, localCameraTrack]);

  const toggleAudio = useCallback(() => {
    localMicrophoneTrack?.setEnabled(!audioEnabled);
    setAudioEnabled((v) => !v);
  }, [localMicrophoneTrack, audioEnabled]);

  const toggleVideo = useCallback(() => {
    localCameraTrack?.setEnabled(!videoEnabled);
    setVideoEnabled((v) => !v);
  }, [localCameraTrack, videoEnabled]);

  const handleSaveNotes = async () => {
    if (!notes.trim()) return;
    setSavingNotes(true);
    try {
      await axios.post(`/api/appointments/${appointmentId}/notes`, { notes });
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 3000);
    } catch {
      setCallError(t('videoCall.notesFailed', 'Failed to save notes.'));
    } finally {
      setSavingNotes(false);
    }
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await axios.post(`/api/appointments/${appointmentId}/notes`, { notes, complete: true });
      onEndCall();
    } catch {
      setCallError(t('videoCall.completeFailed', 'Failed to complete consultation.'));
      setCompleting(false);
    }
  };

  const isLoading = micLoading || camLoading;

  const otherName = user?.role === 'PATIENT' ? appointment?.doctorName : appointment?.patientName;

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-white font-semibold">
            {user?.role === 'PATIENT'
              ? `${t('videoCall.withDoctor', 'Consultation with')} ${appointment?.doctorName || ''}`
              : `${t('videoCall.withPatient', 'Appointment with')} ${appointment?.patientName || ''}`}
          </p>
          <p className="text-gray-400 text-sm">{appointment?.specialty || ''}</p>
        </div>
        {isLoading && (
          <div className="flex items-center gap-2 text-yellow-400 text-sm">
            <div className="w-4 h-4 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
            {t('videoCall.connecting', 'Connecting...')}
          </div>
        )}
      </div>

      {callError && (
        <div className="bg-red-900/60 border border-red-500/40 text-red-300 px-4 py-2 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {callError}
        </div>
      )}

      {/* Video Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2 p-2">
        {/* Local video */}
        <div className="relative bg-gray-800 rounded-xl overflow-hidden flex items-center justify-center min-h-[200px] md:min-h-0">
          {localCameraTrack && videoEnabled ? (
            <div
              className="w-full h-full"
              ref={(el) => el && localCameraTrack.play(el)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold mb-2">
                {user?.name?.charAt(0)?.toUpperCase() || 'Y'}
              </div>
              <p className="text-gray-400 text-sm">{t('videoCall.cameraOff', 'Camera off')}</p>
            </div>
          )}
          <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-lg">
            {t('videoCall.you', 'You')} ({user?.name || ''})
          </div>
          {!audioEnabled && (
            <div className="absolute top-2 right-2 bg-red-500/80 rounded-full p-1">
              <MicOff className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        {/* Remote video */}
        {remoteUsers.length > 0 ? (
          remoteUsers.map((remoteUser) => (
            <div key={remoteUser.uid} className="relative bg-gray-800 rounded-xl overflow-hidden flex items-center justify-center min-h-[200px] md:min-h-0">
              <RemoteUser user={remoteUser} className="w-full h-full" />
              <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-lg">
                {otherName || t('videoCall.participant', 'Participant')}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-gray-800 rounded-xl flex flex-col items-center justify-center min-h-[200px] md:min-h-0">
            <div className="w-16 h-16 rounded-full bg-gray-600 flex items-center justify-center text-white text-2xl font-bold mb-2">
              {otherName?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <p className="text-gray-400 text-sm">{t('videoCall.waitingForParticipant', 'Waiting for participant...')}</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-800 px-4 py-4 flex flex-col gap-3">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={toggleAudio}
            className={`p-3 rounded-full transition-colors ${audioEnabled ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
            aria-label={audioEnabled ? t('videoCall.mute', 'Mute') : t('videoCall.unmute', 'Unmute')}
          >
            {audioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>
          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full transition-colors ${videoEnabled ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
            aria-label={videoEnabled ? t('videoCall.disableVideo', 'Disable video') : t('videoCall.enableVideo', 'Enable video')}
          >
            {videoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>
          <button
            onClick={onEndCall}
            className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
            aria-label={t('videoCall.endCall', 'End Call')}
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>

        {/* Doctor consultation notes */}
        {user?.role === 'DOCTOR' && (
          <div className="bg-gray-700 rounded-xl p-3 mt-1">
            <label className="flex items-center gap-2 text-gray-300 text-sm font-medium mb-2">
              <FileText className="w-4 h-4" />
              {t('videoCall.consultationNotes', 'Consultation Notes')}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('videoCall.notesPlaceholder', 'Enter consultation notes...')}
              className="w-full bg-gray-600 text-white text-sm rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder-gray-400"
              rows={3}
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleSaveNotes}
                disabled={savingNotes || !notes.trim()}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium bg-primary/80 hover:bg-primary text-white disabled:opacity-50 transition-colors"
              >
                {notesSaved ? (
                  <><CheckCircle className="w-4 h-4" /> {t('videoCall.notesSaved', 'Saved!')}</>
                ) : (
                  savingNotes ? t('common.saving', 'Saving...') : t('videoCall.saveNotes', 'Save Notes')
                )}
              </button>
              <button
                onClick={handleComplete}
                disabled={completing}
                className="flex-1 py-2 rounded-lg text-sm font-medium bg-secondary text-white hover:bg-secondary/90 disabled:opacity-50 transition-colors"
              >
                {completing ? t('common.saving', 'Saving...') : t('videoCall.consultationComplete', 'Consultation Complete')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VideoCallPage() {
  const { t } = useTranslation();
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [tokenData, setTokenData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [client] = useState(() => AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' }));

  useEffect(() => {
    if (!appointmentId) return;
    Promise.all([
      axios.get(`/api/appointments/${appointmentId}`),
      axios.get(`/api/video/token/${appointmentId}`),
    ])
      .then(([apptRes, tokenRes]) => {
        setAppointment(apptRes.data);
        setTokenData(tokenRes.data);
      })
      .catch((err) => {
        if (err?.response?.status === 403 || err?.message?.includes('Permission')) {
          setError(t('videoCall.permissionDenied', 'Camera/Microphone permission denied. Please allow access and try again.'));
        } else {
          setError(t('videoCall.loadFailed', 'Failed to initialize video call. Please try again.'));
        }
      })
      .finally(() => setLoading(false));
  }, [appointmentId, t]);

  const handleEndCall = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">{t('videoCall.initializing', 'Initializing video call...')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-white font-semibold mb-2">{t('videoCall.errorTitle', 'Unable to join call')}</p>
          <p className="text-gray-400 text-sm mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="w-full py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
          >
            {t('common.goBack', 'Go Back')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <AgoraRTCProvider client={client}>
      <VideoCallUI
        appointment={appointment}
        token={tokenData?.token}
        channelName={tokenData?.channelName || appointmentId}
        onEndCall={handleEndCall}
      />
    </AgoraRTCProvider>
  );
}
