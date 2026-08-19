import { useState } from "react";
import {
  canStartVoiceCall,
  isUtterance,
  sendDialogue,
  spokenText,
  toDialoguePayload,
  useChildVoiceCall,
} from "@/voice";

const STATUS_LABEL = {
  idle: "대화 시작",
  connecting: "연결 중",
  connected: "듣는 중",
  speaking: "말하는 중",
  error: "다시 시도",
} as const;

const STATUS_STYLE = {
  idle: "bg-[#f3b781] shadow-[#e7a469]/35 hover:scale-105",
  connecting: "animate-pulse bg-[#d9c6b8] shadow-[#d9c6b8]/40",
  connected: "bg-[#f0a766] shadow-[#f0a766]/45",
  speaking: "animate-pulse bg-[#db7d65] shadow-[#db7d65]/50",
  error: "bg-[#c85d5d] shadow-[#c85d5d]/35",
} as const;

export function VoiceTalkView() {
  const ready = canStartVoiceCall();
  const [sendError, setSendError] = useState("");
  const { status, error, history, nearbySpeech, startCall, endCall } = useChildVoiceCall();
  const inCall = status === "connected" || status === "speaking";
  const utterances = history.filter(isUtterance);
  const message = sendError || error || (!ready ? "이 브라우저에서는 음성 대화를 사용할 수 없습니다." : "");

  async function handleCircleClick() {
    setSendError("");
    if (!inCall) {
      await startCall();
      return;
    }

    const dialogue = toDialoguePayload(history);
    endCall();
    try {
      await sendDialogue(dialogue);
    } catch (caught) {
      setSendError(caught instanceof Error ? caught.message : String(caught));
    }
  }

  const soundScale = nearbySpeech?.open ? Math.min(1.12, 1 + nearbySpeech.rms * 3) : 1;

  return (
    <main className="grid min-h-svh place-items-center overflow-hidden bg-[radial-gradient(circle_at_center,#fff6eb_0,#f8eee5_52%,#eee1d7_100%)] p-6 text-[#342721]">
      <button
        type="button"
        disabled={!ready || status === "connecting"}
        onClick={() => void handleCircleClick()}
        aria-label={`${STATUS_LABEL[status]}. ${message}`.trim()}
        title={message || STATUS_LABEL[status]}
        className={`grid size-[min(68vw,19rem)] place-items-center rounded-full text-xl font-bold text-white shadow-[0_28px_80px] transition duration-300 focus-visible:outline-4 focus-visible:outline-offset-8 focus-visible:outline-[#75432f] disabled:cursor-not-allowed ${STATUS_STYLE[status]}`}
        style={{ transform: `scale(${soundScale})` }}
      >
        {STATUS_LABEL[status]}
      </button>

      <p className="sr-only" aria-live="polite">{message || STATUS_LABEL[status]}</p>

      {import.meta.env.DEV && (
        <section className="fixed inset-x-4 bottom-4 max-h-56 overflow-auto rounded-2xl bg-[#2c211d]/90 p-4 text-sm text-white shadow-2xl backdrop-blur" aria-label="개발용 대화 전사">
          {message && <p className="mb-3 text-[#ffb8a9]">{message}</p>}
          {utterances.length ? (
            <ol className="space-y-2">
              {utterances.map((item) => (
                <li key={item.itemId}>
                  <strong className="mr-2 text-[#efb688]">{item.role === "user" ? "아이" : "코코아"}</strong>
                  {spokenText(item) || "(음성 인식 중…)"}
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-white/60">전사 대기 중…</p>
          )}
        </section>
      )}
    </main>
  );
}
