import { ArrowLeft, Brain, Heart, Lightbulb, LoaderCircle } from "lucide-react";
import type { ReactNode } from "react";
import { Link, useParams } from "react-router";
import useSWR from "swr";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brand } from "../components/Brand";
import type { CounselingSessionDetail } from "../counseling/counselingApi";
import { ApiError } from "../lib/apiClient";

const statusLabels: Record<CounselingSessionDetail["status"], string> = {
  DRAFT: "상담 준비",
  RECORDING: "대화 진행 중",
  TRANSCRIBING: "대화 정리 중",
  ANALYZING: "마음 분석 중",
  COMPLETED: "분석 완료",
  FAILED: "다시 시도 필요",
};

export function CounselingDetailView() {
  const { childId, sessionId } = useParams();
  const childProfileId = Number(childId);
  const counselingSessionId = Number(sessionId);
  const isValid =
    Number.isInteger(childProfileId) &&
    childProfileId > 0 &&
    Number.isInteger(counselingSessionId) &&
    counselingSessionId > 0;
  const detailKey = isValid
    ? `/api/children/${childProfileId}/counseling-sessions/${counselingSessionId}`
    : null;
  const { data, error, isLoading } = useSWR<CounselingSessionDetail, ApiError>(detailKey);

  return (
    <main className="min-h-svh bg-[#fbf7f3] text-[#342721]">
      <header className="flex min-h-16 items-center justify-between border-b border-[#eadfd8] bg-white/90 px-4 backdrop-blur sm:px-7">
        <Brand />
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/children/${childProfileId}/counseling`}><ArrowLeft /> 아이 공간</Link>
        </Button>
      </header>

      <section className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-7 lg:py-12">
        {isLoading ? (
          <div className="grid min-h-80 place-items-center text-sm text-[#79685f]">
            <span className="flex items-center gap-2"><LoaderCircle className="size-4 animate-spin" />상담 기록을 불러오는 중...</span>
          </div>
        ) : error || !data ? (
          <Alert variant="destructive">
            <AlertDescription>{error?.message ?? "상담 기록을 찾을 수 없습니다."}</AlertDescription>
          </Alert>
        ) : (
          <>
            <header>
              <span className="inline-flex rounded-full bg-[#f3e6dd] px-3 py-1.5 text-xs font-semibold text-[#865039]">
                {statusLabels[data.status]}
              </span>
              <p className="mt-5 text-sm text-[#8b786e]">{data.date}</p>
              <h1 className="mt-2 text-3xl font-bold tracking-[-.05em] sm:text-4xl">{data.title}</h1>
            </header>

            <Card className="mt-7 border-[#eadfd8] bg-white">
              <CardHeader><CardTitle>부모님이 남긴 상황</CardTitle></CardHeader>
              <CardContent><p className="whitespace-pre-wrap leading-7 text-[#65564f]">{data.content}</p></CardContent>
            </Card>

            {data.analysisReport ? (
              <section className="mt-8" aria-labelledby="analysis-title">
                <h2 id="analysis-title" className="text-xl font-bold">코코아의 마음 리포트</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <ReportCard icon={<Brain />} title="상황 요약" content={data.analysisReport.summary} />
                  <ReportCard icon={<Heart />} title="아이의 감정" content={data.analysisReport.emotionSummary} />
                  <ReportCard icon={<Lightbulb />} title="대화 방향" content={data.analysisReport.parentingGuidance} />
                </div>
              </section>
            ) : (
              <Card className="mt-8 border-[#ecd9cd] bg-[#fff7f1]">
                <CardContent className="flex gap-4 px-5 py-6">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#f3e0d3] text-[#a8623e]"><Brain className="size-5" /></span>
                  <div><strong>마음 리포트가 아직 준비되지 않았어요</strong><p className="mt-1 text-sm leading-6 text-[#79685f]">아이와의 상담이 완료되면 상황 요약과 감정, 부모님을 위한 대화 방향이 이곳에 표시됩니다.</p></div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </section>
    </main>
  );
}

function ReportCard({ icon, title, content }: { icon: ReactNode; title: string; content: string }) {
  return (
    <Card className="border-[#eadfd8] bg-white">
      <CardContent className="px-5 py-6">
        <span className="grid size-10 place-items-center rounded-xl bg-[#f5e8dd] text-[#a8623e] [&>svg]:size-5">{icon}</span>
        <h3 className="mt-4 font-bold">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-[#79685f]">{content}</p>
      </CardContent>
    </Card>
  );
}
