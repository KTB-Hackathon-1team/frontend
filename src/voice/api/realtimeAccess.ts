import type { RealtimeSessionConfig } from "@openai/agents/realtime";
import childAgentSession from "../config/childAgentSession.json";

export const CHILD_AGENT_MODEL = childAgentSession.session.model;
export const CHILD_AGENT_INSTRUCTIONS = childAgentSession.session.instructions;

export function childAgentCallConfig(): Partial<RealtimeSessionConfig> {
  const { audio, output_modalities } = childAgentSession.session;
  const { input, output } = audio;

  return {
    outputModalities: output_modalities as ("text" | "audio")[],
    audio: {
      input: {
        format: { type: "audio/pcm", rate: input.format.rate },
        transcription: input.transcription,
        noiseReduction: { type: input.noise_reduction.type },
        turnDetection: input.turn_detection,
      },
      output: {
        format: { type: "audio/pcm", rate: output.format.rate },
        voice: output.voice,
        speed: output.speed,
      },
    },
  };
}

export async function issueBrowserRealtimeKey(apiKey: string): Promise<string> {
  // ponytail: raw browser key is hackathon-only; replace with a backend-issued
  // ephemeral credential before publishing.
  const response = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(childAgentSession),
  });
  const data = (await response.json()) as {
    value?: string;
    error?: { message?: string };
  };

  if (!response.ok || !data.value?.startsWith("ek_")) {
    throw new Error(data.error?.message ?? `브라우저 통화 키 발급 실패 (${response.status})`);
  }
  return data.value;
}
