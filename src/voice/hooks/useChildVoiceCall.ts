import { useCallback, useEffect, useRef, useState } from "react";
import {
  OpenAIRealtimeWebRTC,
  RealtimeAgent,
  RealtimeSession,
  type RealtimeItem,
} from "@openai/agents/realtime";
import {
  CHILD_AGENT_INSTRUCTIONS,
  CHILD_AGENT_MODEL,
  childAgentCallConfig,
  issueBrowserRealtimeKey,
} from "../api/realtimeAccess";
import { openChildMicrophone } from "../lib/microphone";
import { openNearbySpeechInput, type NearbySpeechLevel } from "../lib/nearbySpeech";

export type VoiceCallStatus = "idle" | "connecting" | "connected" | "speaking" | "error";

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return String(error);
}

export function useChildVoiceCall() {
  const sessionRef = useRef<RealtimeSession | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const micStopRef = useRef<(() => void) | null>(null);
  const [status, setStatus] = useState<VoiceCallStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<RealtimeItem[]>([]);
  const [nearbySpeech, setNearbySpeech] = useState<NearbySpeechLevel | null>(null);

  const endCall = useCallback(() => {
    sessionRef.current?.close();
    sessionRef.current = null;
    micStopRef.current?.();
    micStopRef.current = null;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.srcObject = null;
      audioRef.current = null;
    }
    setNearbySpeech(null);
    setStatus("idle");
  }, []);

  useEffect(() => () => endCall(), [endCall]);

  const startCall = useCallback(async () => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY?.trim();
    if (!apiKey) {
      setError("VITE_OPENAI_API_KEY가 필요합니다.");
      setStatus("error");
      return;
    }

    endCall();
    setError(null);
    setHistory([]);
    setStatus("connecting");

    try {
      const audio = document.createElement("audio");
      audio.autoplay = true;
      audio.setAttribute("playsinline", "true");
      audioRef.current = audio;

      const rawMic = await openChildMicrophone();
      const nearby = await openNearbySpeechInput(rawMic, setNearbySpeech);
      micStopRef.current = nearby.stop;

      const session = new RealtimeSession(
        new RealtimeAgent({ name: "코코아", instructions: CHILD_AGENT_INSTRUCTIONS }),
        {
          transport: new OpenAIRealtimeWebRTC({
            audioElement: audio,
            mediaStream: nearby.stream,
          }),
          model: CHILD_AGENT_MODEL,
          config: childAgentCallConfig(),
        },
      );

      session.on("history_updated", setHistory);
      session.on("audio_start", () => setStatus("speaking"));
      session.on("audio_stopped", () => setStatus("connected"));
      session.on("audio_interrupted", () => setStatus("connected"));
      session.on("error", (event) => {
        setError(errorMessage(event.error));
        setStatus("error");
      });
      sessionRef.current = session;

      await session.connect({ apiKey: await issueBrowserRealtimeKey(apiKey) });
      setStatus((current) => (current === "speaking" ? current : "connected"));
    } catch (caught) {
      sessionRef.current?.close();
      sessionRef.current = null;
      micStopRef.current?.();
      micStopRef.current = null;
      audioRef.current = null;
      setNearbySpeech(null);
      setError(errorMessage(caught));
      setStatus("error");
    }
  }, [endCall]);

  return { status, error, history, nearbySpeech, startCall, endCall };
}
