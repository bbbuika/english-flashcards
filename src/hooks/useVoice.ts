'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { SignalMsg } from '@/lib/types';

const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

export function useVoice(code: string, myId: string, remoteIds: string[]) {
  const [active, setActive] = useState(false);
  const [muted, setMuted] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [connectedIds, setConnectedIds] = useState<string[]>([]);

  const localRef = useRef<MediaStream | null>(null);
  const pcsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const initiatedRef = useRef<Set<string>>(new Set());
  const sinceRef = useRef<number>(0);
  const audioRef = useRef<Map<string, HTMLAudioElement>>(new Map());

  const postSignal = useCallback(
    (to: string, kind: string, data: string) =>
      fetch(`/api/rooms/${code}/signal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: myId, to, kind, data }),
      }).catch(() => {}),
    [code, myId],
  );

  const getOrCreatePC = useCallback(
    (remoteId: string) => {
      const existing = pcsRef.current.get(remoteId);
      if (existing) return existing;

      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      pcsRef.current.set(remoteId, pc);

      const stream = localRef.current;
      if (stream) stream.getTracks().forEach((t) => pc.addTrack(t, stream));

      pc.ontrack = ({ streams }) => {
        let audio = audioRef.current.get(remoteId);
        if (!audio) {
          audio = document.createElement('audio');
          audio.autoplay = true;
          audioRef.current.set(remoteId, audio);
        }
        audio.srcObject = streams[0];
        audio.play().catch(() => {});
      };

      pc.onicecandidate = ({ candidate }) => {
        if (candidate) void postSignal(remoteId, 'candidate', JSON.stringify(candidate.toJSON()));
      };

      pc.onconnectionstatechange = () => {
        const s = pc.connectionState;
        setConnectedIds((prev) => {
          const next = prev.filter((id) => id !== remoteId);
          if (s === 'connected') return [...next, remoteId];
          return next;
        });
        if (s === 'failed' || s === 'closed') {
          pcsRef.current.delete(remoteId);
          initiatedRef.current.delete(remoteId);
        }
      };

      return pc;
    },
    [postSignal],
  );

  const handleSignal = useCallback(
    async (sig: SignalMsg) => {
      const { from, kind, data } = sig;
      if (kind === 'offer') {
        const pc = getOrCreatePC(from);
        if (pc.signalingState !== 'stable' && pc.signalingState !== 'have-remote-offer') return;
        await pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(data) as RTCSessionDescriptionInit));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        void postSignal(from, 'answer', JSON.stringify(pc.localDescription));
      } else if (kind === 'answer') {
        const pc = pcsRef.current.get(from);
        if (pc?.signalingState === 'have-local-offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(data) as RTCSessionDescriptionInit));
        }
      } else if (kind === 'candidate') {
        const pc = pcsRef.current.get(from);
        if (pc?.remoteDescription) {
          await pc.addIceCandidate(new RTCIceCandidate(JSON.parse(data) as RTCIceCandidateInit));
        }
      }
    },
    [getOrCreatePC, postSignal],
  );

  // Poll for signals while voice is active
  useEffect(() => {
    if (!active || !myId) return;
    let cancelled = false;
    const poll = async () => {
      if (cancelled) return;
      try {
        const res = await fetch(
          `/api/rooms/${code}/signal?playerId=${encodeURIComponent(myId)}&since=${sinceRef.current}`,
          { cache: 'no-store' },
        );
        if (!res.ok || cancelled) return;
        const sigs: SignalMsg[] = await res.json();
        for (const sig of sigs) {
          if (sig.ts > sinceRef.current) sinceRef.current = sig.ts;
          await handleSignal(sig).catch(() => {});
        }
      } catch {}
    };
    const id = setInterval(poll, 500);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [code, myId, active, handleSignal]);

  // Initiate connections to new remote peers (smaller ID sends offer)
  useEffect(() => {
    if (!active || !localRef.current) return;
    for (const remoteId of remoteIds) {
      if (remoteId === myId || initiatedRef.current.has(remoteId)) continue;
      if (myId < remoteId) {
        initiatedRef.current.add(remoteId);
        const pc = getOrCreatePC(remoteId);
        pc.createOffer()
          .then((offer) => pc.setLocalDescription(offer))
          .then(() => {
            if (pc.localDescription) void postSignal(remoteId, 'offer', JSON.stringify(pc.localDescription));
          })
          .catch(() => initiatedRef.current.delete(remoteId));
      }
    }
  }, [active, remoteIds, myId, getOrCreatePC, postSignal]);

  // Close connections for peers that left
  useEffect(() => {
    const current = new Set(remoteIds);
    for (const [id, pc] of pcsRef.current) {
      if (!current.has(id)) {
        pc.close();
        pcsRef.current.delete(id);
        initiatedRef.current.delete(id);
        const audio = audioRef.current.get(id);
        if (audio) { audio.srcObject = null; audioRef.current.delete(id); }
      }
    }
  }, [remoteIds]);

  const startVoice = useCallback(async () => {
    setMicError(null);
    sinceRef.current = Date.now() - 1000;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localRef.current = stream;
      setActive(true);
    } catch {
      setMicError('mic_denied');
    }
  }, []);

  const stopVoice = useCallback(() => {
    setActive(false);
    for (const pc of pcsRef.current.values()) pc.close();
    pcsRef.current.clear();
    initiatedRef.current.clear();
    if (localRef.current) {
      localRef.current.getTracks().forEach((t) => t.stop());
      localRef.current = null;
    }
    for (const audio of audioRef.current.values()) audio.srcObject = null;
    audioRef.current.clear();
    setConnectedIds([]);
    setMuted(false);
  }, []);

  const toggleMute = useCallback(() => {
    if (!localRef.current) return;
    const next = !muted;
    localRef.current.getAudioTracks().forEach((t) => { t.enabled = !next; });
    setMuted(next);
  }, [muted]);

  useEffect(() => () => { stopVoice(); }, [stopVoice]);

  return { active, muted, micError, connectedIds, startVoice, stopVoice, toggleMute };
}
