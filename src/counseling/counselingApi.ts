import { apiRequest } from "../lib/apiClient";

export type CounselingSessionStatus =
  | "DRAFT"
  | "RECORDING"
  | "TRANSCRIBING"
  | "ANALYZING"
  | "COMPLETED"
  | "FAILED";

export type CounselingSession = {
  id: number;
  date: string;
  title: string;
  content: string;
};

export type CounselingSessionPage = {
  items: CounselingSession[];
  nextCursorId: number | null;
  hasNext: boolean;
};

export type CounselingAnalysisReport = {
  summary: string;
  emotionSummary: string;
  parentingGuidance: string;
  resultPayload: string | null;
  modelName: string;
  promptVersion: string;
};

export type CounselingSessionDetail = CounselingSession & {
  status: CounselingSessionStatus;
  startedAt: string | null;
  endedAt: string | null;
  analysisReport: CounselingAnalysisReport | null;
};

export type CreateCounselingSessionInput = {
  title: string;
  content: string;
};

export function createCounselingSession(
  childProfileId: number,
  input: CreateCounselingSessionInput,
) {
  return apiRequest<CounselingSession>(
    `/api/children/${childProfileId}/counseling-sessions`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export function getCounselingSessionDetail(
  childProfileId: number,
  sessionId: number,
) {
  return apiRequest<CounselingSessionDetail>(
    `/api/children/${childProfileId}/counseling-sessions/${sessionId}`,
  );
}
