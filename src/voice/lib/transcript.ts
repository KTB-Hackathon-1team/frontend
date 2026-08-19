import type { RealtimeItem, RealtimeMessageItem } from "@openai/agents/realtime";

export type DialogueTurn = {
  role: "user" | "assistant";
  text: string;
  itemId: string;
  status?: string;
};

export type DialoguePayload = {
  turns: DialogueTurn[];
  text: string;
};

export function isUtterance(item: RealtimeItem): item is RealtimeMessageItem {
  return item.type === "message" && item.role !== "system";
}

export function spokenText(item: RealtimeItem): string {
  if (item.type !== "message") return "";
  return item.content
    .map((part) => {
      if ("text" in part) return part.text;
      if ("transcript" in part) return part.transcript ?? "";
      return "";
    })
    .filter(Boolean)
    .join(" ")
    .trim();
}

export function toDialoguePayload(history: RealtimeItem[]): DialoguePayload {
  const turns = history.filter(isUtterance).flatMap((item) => {
    const text = spokenText(item);
    if (!text || (item.role !== "user" && item.role !== "assistant")) return [];
    return [{ role: item.role, text, itemId: item.itemId, status: item.status }];
  });

  return {
    turns,
    text: turns.length
      ? turns
          .map((turn) => `${turn.role === "user" ? "아이" : "에이전트"}: ${turn.text}`)
          .join("\n")
      : "(대화 이력 없음)",
  };
}
