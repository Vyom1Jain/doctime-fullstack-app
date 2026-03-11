import React, { useEffect, useState, useRef } from "react";
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
  const [remoteUser, setRemoteUser] = useState(null);
  const [audioMuted, setAudioMuted] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);
  const [error, setError] = useState(null);
  const [showNotes, setShowNotes] = useState(false);

  const clientRef = useRef(null);
  const localTracksRef = useRef({ audioTrack: null, videoTrack: null });
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const initRef = useRef(false); // prevent StrictMode double-init

  // Play remote video whenever remoteUser or its videoTrack changes
  useEffect(() => {
    const el = remoteVideoRef.current;
    const track = remoteUser?.videoTrack;
    if (el && track) {
      track.play(el);
    }
    return () => {
      // Stop playing on the element when unmounting or track changes
      if (track) {
        try {
          track.stop();
        } catch (_) {}
      }
    };
  }, [remoteUser]);

  // Play local video when joined and div is available
  useEffect(() => {
    const { videoTrack } = localTracksRef.current;
    if (joined && videoTrack && localVideoRef.current) {
      videoTrack.play(localVideoRef.current);
    }
  }, [joined]);

  useEffect(() => {
    // Reset init guard when appointmentId changes (new call)
    initRef.current = false;
  }, [appointmentId]);

  useEffect(() => {
    if (initRef.current) return; // StrictMode guard — only init once
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
            "Agora is not configured. Ask your admin to set AGORA_APP_ID.",
          );
        }

        try {
          const noteRes = await videoApi.getNote(appointmentId);
          if (noteRes.data?.content && mounted) setNotes(noteRes.data.content);
        } catch (_) {}

        const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
        clientRef.current = client;

        client.on("connection-state-change", (curState, prevState, reason) => {
          console.log(
            `Agora connection: ${prevState} → ${curState}, reason: ${reason}`,
          );
          if (curState === "DISCONNECTED" && reason === "FALLBACK" && mounted) {
            setError("Video connection lost. Please try again.");
          }
        });

        client.on("user-published", async (ru, mediaType) => {
          await client.subscribe(ru, mediaType);
          if (mediaType === "video" && mounted) {
            setRemoteUser(ru);
          }
          if (mediaType === "audio") {
            ru.audioTrack?.play();
          }
        });

        client.on("user-unpublished", (ru, mediaType) => {
          if (mediaType === "video" && mounted) {
            setRemoteUser(null);
          }
        });

        client.on("user-left", () => {
          if (mounted) {
            setRemoteUser(null);
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
              "Failed to connect to video. Check camera/mic permissions.",
          );
      }
    };
    init();

    return () => {
      mounted = false;
      // Do NOT reset initRef here — it must survive StrictMode remount
      const cleanup = async () => {
        const { audioTrack, videoTrack } = localTracksRef.current;
        try {
          audioTrack?.stop();
        } catch (_) {}
        try {
          audioTrack?.close();
        } catch (_) {}
        try {
          videoTrack?.stop();
        } catch (_) {}
        try {
          videoTrack?.close();
        } catch (_) {}
        localTracksRef.current = { audioTrack: null, videoTrack: null };
        try {
          await clientRef.current?.leave();
        } catch (_) {}
        clientRef.current = null;
      };
      cleanup();
    };
  }, [appointmentId]);

  const handleEndCall = async () => {
    try {
      const client = clientRef.current;
      const { audioTrack, videoTrack } = localTracksRef.current;

      // 1. Stop remote tracks (incoming audio/video)
      if (remoteUser) {
        try {
          remoteUser.audioTrack?.stop();
        } catch (_) {}
        try {
          remoteUser.videoTrack?.stop();
        } catch (_) {}
      }
      setRemoteUser(null);

      // 2. Unpublish local tracks from channel (stops outgoing)
      if (client) {
        try {
          await client.unpublish([audioTrack, videoTrack].filter(Boolean));
        } catch (_) {}
      }

      // 3. Stop and close local tracks to release camera/mic
      if (audioTrack) {
        try {
          audioTrack.stop();
        } catch (_) {}
        try {
          audioTrack.close();
        } catch (_) {}
      }
      if (videoTrack) {
        try {
          videoTrack.stop();
        } catch (_) {}
        try {
          videoTrack.close();
        } catch (_) {}
      }
      localTracksRef.current = { audioTrack: null, videoTrack: null };

      // 4. Leave channel (severs connection entirely)
      if (client) {
        try {
          await client.leave();
        } catch (_) {}
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
            className={`text-xs px-3 py-1 rounded-full transition-colors ${audioMuted ? "bg-yellow-500" : "bg-slate-700 hover:bg-slate-600"}`}>
            {audioMuted ? "🔇 Unmute" : "🎤 Mute"}
          </button>
          <button
            onClick={toggleVideo}
            className={`text-xs px-3 py-1 rounded-full transition-colors ${videoMuted ? "bg-yellow-500" : "bg-slate-700 hover:bg-slate-600"}`}>
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
          ) : (
            <>
              {remoteUser ? (
                <div ref={remoteVideoRef} className="w-full h-full" />
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
            </>
          )}
        </div>

        {/* Local video - always in DOM so track can play on it; visible only when joined */}
        <div
          ref={localVideoRef}
          className={`absolute bottom-4 right-4 w-36 h-28 rounded-lg bg-slate-700 overflow-hidden border-2 border-slate-600 z-10 ${joined ? "" : "hidden"}`}
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
