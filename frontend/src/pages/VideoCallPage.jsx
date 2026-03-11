import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { videoApi } from "../services/api";
import AgoraRTC from "agora-rtc-sdk-ng";

const VideoCallPage = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [joined, setJoined] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [audioMuted, setAudioMuted] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);
  const [error, setError] = useState(null);
  const [showNotes, setShowNotes] = useState(false);

  const clientRef = useRef(null);
  const localTracksRef = useRef({ audioTrack: null, videoTrack: null });
  const localVideoRef = useRef(null);
  const remoteVideoRefs = useRef({});
  const initRef = useRef(false);

  // Play remote video tracks whenever remoteUsers changes
  useEffect(() => {
    remoteUsers.forEach((ru) => {
      const el = remoteVideoRefs.current[ru.uid];
      if (el && ru.videoTrack) {
        try { ru.videoTrack.play(el); } catch (_) {}
      }
      if (ru.audioTrack) {
        try { ru.audioTrack.play(); } catch (_) {}
      }
    });
  }, [remoteUsers]);

  // Play local video when joined
  useEffect(() => {
    const { videoTrack } = localTracksRef.current;
    if (joined && videoTrack && localVideoRef.current) {
      try { videoTrack.play(localVideoRef.current); } catch (_) {}
    }
  }, [joined]);

  useEffect(() => {
    initRef.current = false;
  }, [appointmentId]);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    let mounted = true;

    const init = async () => {
      try {
        const channelName = `appt_${appointmentId}`;
        const tokenRes = await videoApi.getToken({
          channelName,
          appointmentId: Number(appointmentId),
          uid: 0,
        });
        const { appId, token, uid } = tokenRes.data;

        if (!appId || appId === "YOUR_AGORA_APP_ID") {
          throw new Error(
            "Agora is not configured. Ask your admin to set AGORA_APP_ID."
          );
        }

        try {
          const noteRes = await videoApi.getNote(appointmentId);
          if (noteRes.data?.content && mounted) setNotes(noteRes.data.content);
        } catch (_) {}

        const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
        clientRef.current = client;

        client.on("connection-state-change", (curState, prevState, reason) => {
          if (curState === "DISCONNECTED" && reason === "FALLBACK" && mounted) {
            setError("Video connection lost. Please try again.");
          }
        });

        // user-published: subscribe then add/update in state so the ref div exists
        client.on("user-published", async (ru, mediaType) => {
          await client.subscribe(ru, mediaType);
          if (mounted) {
            setRemoteUsers((prev) => {
              const existing = prev.find((u) => u.uid === ru.uid);
              if (existing) {
                return prev.map((u) => (u.uid === ru.uid ? ru : u));
              }
              return [...prev, ru];
            });
          }
        });

        client.on("user-unpublished", (ru, mediaType) => {
          if (mediaType === "video" && mounted) {
            // Keep user in list but their videoTrack will be null
            setRemoteUsers((prev) =>
              prev.map((u) => (u.uid === ru.uid ? ru : u))
            );
          }
        });

        client.on("user-left", (ru) => {
          if (mounted) {
            setRemoteUsers((prev) => prev.filter((u) => u.uid !== ru.uid));
            delete remoteVideoRefs.current[ru.uid];
          }
        });

        await client.join(appId, channelName, token || null, uid || 0);

        const [audioTrack, videoTrack] =
          await AgoraRTC.createMicrophoneAndCameraTracks();
        localTracksRef.current = { audioTrack, videoTrack };

        await client.publish([audioTrack, videoTrack]);
        if (mounted) setJoined(true);
      } catch (e) {
        console.error("Video init error:", e);
        if (mounted)
          setError(
            e.message ||
              "Failed to connect to video. Check camera/mic permissions."
          );
      }
    };

    init();

    return () => {
      mounted = false;
      const cleanup = async () => {
        const { audioTrack, videoTrack } = localTracksRef.current;
        try { audioTrack?.stop(); } catch (_) {}
        try { audioTrack?.close(); } catch (_) {}
        try { videoTrack?.stop(); } catch (_) {}
        try { videoTrack?.close(); } catch (_) {}
        localTracksRef.current = { audioTrack: null, videoTrack: null };
        try { await clientRef.current?.leave(); } catch (_) {}
        clientRef.current = null;
      };
      cleanup();
    };
  }, [appointmentId]);

  const handleEndCall = async () => {
    try {
      const client = clientRef.current;
      const { audioTrack, videoTrack } = localTracksRef.current;

      remoteUsers.forEach((ru) => {
        try { ru.audioTrack?.stop(); } catch (_) {}
        try { ru.videoTrack?.stop(); } catch (_) {}
      });
      setRemoteUsers([]);

      if (client) {
        try {
          await client.unpublish([audioTrack, videoTrack].filter(Boolean));
        } catch (_) {}
      }
      try { audioTrack?.stop(); } catch (_) {}
      try { audioTrack?.close(); } catch (_) {}
      try { videoTrack?.stop(); } catch (_) {}
      try { videoTrack?.close(); } catch (_) {}
      localTracksRef.current = { audioTrack: null, videoTrack: null };

      if (client) {
        try { await client.leave(); } catch (_) {}
      }
      clientRef.current = null;
    } catch (_) {}
    setJoined(false);
    navigate("/appointments");
  };

  const toggleAudio = async () => {
    const { audioTrack } = localTracksRef.current;
    if (!audioTrack) return;
    try {
      await audioTrack.setMuted(!audioMuted);
      setAudioMuted(!audioMuted);
    } catch (e) {
      console.error("Audio toggle error:", e);
    }
  };

  const toggleVideo = async () => {
    const { videoTrack } = localTracksRef.current;
    if (!videoTrack) return;
    try {
      await videoTrack.setMuted(!videoMuted);
      setVideoMuted(!videoMuted);
    } catch (e) {
      console.error("Video toggle error:", e);
    }
  };

  const handleSaveNotes = async () => {
    if (!notes.trim()) return;
    setSaving(true);
    try {
      await videoApi.saveNote(appointmentId, notes);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
      alert("Failed to save notes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-screen bg-slate-900 text-white flex flex-col overflow-hidden">
      <header className="px-4 py-3 flex items-center justify-between bg-slate-950/60 shrink-0">
        <div>
          <p className="text-xs text-slate-300">Video consultation</p>
          <p className="text-sm font-semibold">Appointment #{appointmentId}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleAudio}
            className={`text-xs px-3 py-1 rounded-full transition-colors ${
              audioMuted ? "bg-yellow-500" : "bg-slate-700 hover:bg-slate-600"
            }`}>
            {audioMuted ? "🔇 Unmute" : "🎤 Mute"}
          </button>
          <button
            onClick={toggleVideo}
            className={`text-xs px-3 py-1 rounded-full transition-colors ${
              videoMuted ? "bg-yellow-500" : "bg-slate-700 hover:bg-slate-600"
            }`}>
            {videoMuted ? "📷 Show" : "📹 Hide"}
          </button>
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="text-xs px-3 py-1 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors">
            📝 Notes
          </button>
          <button
            onClick={handleEndCall}
            className="text-xs bg-red-500 hover:bg-red-600 px-3 py-1 rounded-full transition-colors">
            ✕ End
          </button>
        </div>
      </header>

      <main className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
          {error ? (
            <div className="text-center space-y-2">
              <p className="text-red-400 text-sm">{error}</p>
              <button
                onClick={() => navigate("/appointments")}
                className="text-xs text-primary underline">
                Go back
              </button>
            </div>
          ) : !joined ? (
            <div className="text-center space-y-2">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="text-sm text-slate-400">Connecting to video…</p>
            </div>
          ) : remoteUsers.length > 0 ? (
            <div className="w-full h-full grid grid-cols-1">
              {remoteUsers.map((ru) => (
                <div
                  key={ru.uid}
                  ref={(el) => {
                    if (el) {
                      remoteVideoRefs.current[ru.uid] = el;
                      // Play immediately if track already available when div mounts
                      if (ru.videoTrack) {
                        try { ru.videoTrack.play(el); } catch (_) {}
                      }
                    }
                  }}
                  className="w-full h-full"
                />
              ))}
            </div>
          ) : (
            <div className="text-center space-y-3">
              <div className="animate-pulse text-5xl">👤</div>
              <p className="text-sm text-slate-300 font-medium">
                Waiting for other participant to join…
              </p>
              <p className="text-xs text-slate-500">
                Share the appointment link with the other person
              </p>
            </div>
          )}
        </div>

        {/* Local video pip */}
        <div
          ref={localVideoRef}
          className={`absolute bottom-4 right-4 w-36 h-28 rounded-lg bg-slate-700 overflow-hidden border-2 border-slate-600 z-10 ${
            joined ? "" : "hidden"
          }`}
        />

        {showNotes && (
          <aside className="absolute top-0 right-0 h-full w-72 bg-slate-950/90 backdrop-blur p-4 flex flex-col z-20 border-l border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold">{t("video.notes")}</h2>
              <button
                onClick={() => setShowNotes(false)}
                className="text-xs text-slate-400 hover:text-white">
                ✕
              </button>
            </div>
            <textarea
              className="flex-1 rounded-lg bg-slate-900 border border-slate-700 p-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              placeholder="Write notes here during the call…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <button
              onClick={handleSaveNotes}
              disabled={saving}
              className="mt-2 btn-primary text-xs py-1.5 w-full disabled:opacity-50">
              {saving ? "Saving…" : saved ? "✓ Saved!" : "Save Notes"}
            </button>
          </aside>
        )}
      </main>
    </div>
  );
};

export default VideoCallPage;
