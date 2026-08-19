import { apiRequest } from "@/lib/apiClient";
import type { DialoguePayload } from "../lib/transcript";

export function sendDialogue(payload: DialoguePayload) {
  // ponytail: base-only target and payload are placeholders; replace both when
  // the backend dialogue contract is available.
  return apiRequest<void>("", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
