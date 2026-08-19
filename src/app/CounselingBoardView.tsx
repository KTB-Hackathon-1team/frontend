import { SubmitEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpenText,
  ChevronRight,
  Compass,
  Home,
  MessageCircleHeart,
  NotebookTabs,
  Plus,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router";
import useSWR from "swr";
import useSWRInfinite from "swr/infinite";
import useSWRMutation from "swr/mutation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "../lib/apiClient";
import { Brand } from "../components/Brand";
import type { ChildProfile } from "../children/childrenApi";
import {
  CounselingSession,
  CounselingSessionPage,
  CreateCounselingSessionInput,
  createCounselingSession,
} from "../counseling/counselingApi";
import { useAuthStore } from "../stores/authStore";

const CHILDREN_KEY = "/api/children";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function getAge(birthDate: string) {
  const today = new Date();
  const birth = new Date(`${birthDate}T00:00:00`);
  let age = today.getFullYear() - birth.getFullYear();
  if (
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
  ) {
    age -= 1;
  }
  return Math.max(age, 0);
}

function getErrorMessage(error: unknown) {
  return error instanceof ApiError
    ? error.message
    : "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";
}

export function CounselingBoardView() {
  const navigate = useNavigate();
  const { childId } = useParams();
  const childProfileId = Number(childId);
  const isValidChildId = Number.isInteger(childProfileId) && childProfileId > 0;
  const selectChild = useAuthStore((state) => state.selectChild);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createError, setCreateError] = useState("");

  const {
    data: children,
    error: childrenError,
    isLoading: isChildrenLoading,
  } = useSWR<ChildProfile[], ApiError>(CHILDREN_KEY, {
    refreshInterval: 9 * 60 * 1000,
  });

  const child = useMemo(
    () => children?.find((profile) => profile.id === childProfileId) ?? null,
    [childProfileId, children],
  );

  useEffect(() => {
    if (child) selectChild(child.id);
  }, [child, selectChild]);

  const sessionBasePath = `/api/children/${isValidChildId ? childProfileId : 0}/counseling-sessions`;
  const {
    data: sessionPages,
    error: sessionsError,
    isLoading: isSessionsLoading,
    size,
    setSize,
    mutate: mutateSessions,
  } = useSWRInfinite<CounselingSessionPage, ApiError>(
    (pageIndex, previousPage) => {
      if (!isValidChildId) return null;
      if (previousPage && !previousPage.hasNext) return null;
      const cursor =
        pageIndex > 0 && previousPage?.nextCursorId
          ? `&cursorId=${previousPage.nextCursorId}`
          : "";
      return `${sessionBasePath}?size=5${cursor}`;
    },
  );

  const sessions = sessionPages?.flatMap((page) => page.items) ?? [];
  const hasNext = sessionPages?.at(-1)?.hasNext ?? false;

  const { trigger: createSession, isMutating } = useSWRMutation<
    CounselingSession,
    ApiError,
    string,
    CreateCounselingSessionInput
  >(
    sessionBasePath,
    (_, { arg }) => createCounselingSession(childProfileId, arg),
  );

  const handleCreate = useCallback(
    async (event: SubmitEvent<HTMLFormElement>) => {
      event.preventDefault();
      setCreateError("");
      const form = event.currentTarget;
      const formData = new FormData(form);
      const title = String(formData.get("title") ?? "").trim();
      const content = String(formData.get("content") ?? "").trim();

      if (!title || !content) {
        setCreateError("상황 제목과 자세한 내용을 모두 입력해 주세요.");
        return;
      }

      try {
        const created = await createSession({ title, content });
        if (!created) return;
        await mutateSessions();
        form.reset();
        setIsCreateOpen(false);
        navigate(`/children/${childProfileId}/counseling/${created.id}`);
      } catch (error) {
        setCreateError(getErrorMessage(error));
      }
    },
    [childProfileId, createSession, mutateSessions, navigate],
  );

  if (!isValidChildId) {
    return <InvalidChildState message="올바르지 않은 아이 주소입니다." />;
  }

  if (isChildrenLoading) {
    return (
      <main className="grid min-h-svh place-items-center bg-[#fbf7f3] text-sm text-[#79685f]">
        아이 정보를 불러오는 중...
      </main>
    );
  }

  if (childrenError || !child) {
    return (
      <InvalidChildState
        message={childrenError?.message ?? "아이 정보를 찾을 수 없습니다."}
      />
    );
  }

  return (
    <main className="min-h-svh bg-[#fbf7f3] text-[#342721]">
      <div className="min-h-svh lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="hidden min-h-svh flex-col border-r border-[#eadfd8] bg-[#fffaf6] px-5 py-7 lg:flex">
          <Brand />
          <div className="mt-10 border-b border-[#eadfd8] pb-6">
            <Avatar className="size-16 rounded-2xl" size="lg">
              <AvatarImage src={child.profileImageUrl ?? undefined} alt={`${child.name} 프로필`} />
              <AvatarFallback className="rounded-2xl bg-[#efcbb1] text-xl font-bold text-[#75432f]">
                {child.name.slice(0, 1)}
              </AvatarFallback>
            </Avatar>
            <strong className="mt-3 block text-base">{child.name}이</strong>
            <span className="mt-1 block text-xs text-[#79685f]">
              만 {getAge(child.birthDate)}세 · {child.gender === "MALE" ? "남아" : "여아"}
            </span>
          </div>

          <nav className="mt-5 space-y-1 text-sm" aria-label="아이 공간 메뉴">
            <span className="flex items-center gap-3 rounded-xl bg-[#f1e3da] px-3 py-3 font-semibold text-[#75432f]">
              <Home className="size-4" /> 오늘의 공간
            </span>
            <span className="flex items-center gap-3 px-3 py-3 text-[#79685f]">
              <NotebookTabs className="size-4" /> 상담 기록
            </span>
            <span className="flex items-center gap-3 px-3 py-3 text-[#79685f]">
              <Compass className="size-4" /> 육아 길잡이
            </span>
          </nav>

          <Button variant="ghost" className="mt-auto justify-start text-[#79685f]" onClick={() => navigate("/dashboard")}>
            <ArrowLeft /> 아이 선택으로 돌아가기
          </Button>
        </aside>

        <div className="min-w-0">
          <header className="flex min-h-16 items-center justify-between border-b border-[#eadfd8] bg-white/90 px-4 backdrop-blur lg:hidden">
            <Brand />
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowLeft /> 아이 선택
            </Button>
          </header>

          <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-7 lg:px-10 lg:py-12">
            <header>
              <span className="inline-flex rounded-full bg-[#f3e6dd] px-3 py-1.5 text-xs font-semibold text-[#865039]">
                {child.name}이의 마음 공간
              </span>
              <h1 className="mt-4 text-3xl font-bold tracking-[-.05em] sm:text-4xl">
                오늘은 어떤 일이 있었나요?
              </h1>
              <p className="mt-3 text-sm text-[#79685f] sm:text-base">
                상황을 들려주시면 코코아가 다음 단계를 안내할게요.
              </p>
            </header>

            <Card className="mt-8 border-[#ecd9cd] bg-[linear-gradient(135deg,#fff3e9,#fffaf6)] py-0 shadow-sm">
              <CardContent className="grid gap-6 p-6 sm:grid-cols-[1fr_auto] sm:items-center sm:p-8">
                <div>
                  <CardTitle className="text-xl font-bold text-[#342721]">새로운 상담 시작하기</CardTitle>
                  <CardDescription className="mt-2 max-w-xl leading-6 text-[#79685f]">
                    갈등 상황을 먼저 남기고, 아이와 대화할 준비를 시작해요.
                  </CardDescription>
                  <Button
                    className="mt-5 h-11 bg-[#75432f] text-white hover:bg-[#5f3525]"
                    onClick={() => {
                      setCreateError("");
                      setIsCreateOpen(true);
                    }}
                  >
                    상황 작성하기 <ArrowRight />
                  </Button>
                </div>
                <span className="hidden size-24 place-items-center rounded-full bg-[#efcbb1] text-[#75432f] sm:grid">
                  <MessageCircleHeart className="size-10" />
                </span>
              </CardContent>
            </Card>

            <section className="mt-9" aria-labelledby="recent-counseling-title">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 id="recent-counseling-title" className="text-xl font-bold tracking-tight">최근 상담 기록</h2>
                  <p className="mt-1 text-sm text-[#79685f]">{child.name}이와 나눈 상담 상황을 최신순으로 확인할 수 있어요.</p>
                </div>
              </div>

              {sessionsError && (
                <Alert className="mt-5 border-[#efd7c8] bg-[#fff5ed] text-[#8b523a]">
                  <AlertCircle />
                  <AlertDescription>{sessionsError.message}</AlertDescription>
                </Alert>
              )}

              {isSessionsLoading ? (
                <div className="grid min-h-48 place-items-center text-sm text-[#79685f]">상담 기록을 불러오는 중...</div>
              ) : sessions.length ? (
                <div className="mt-5 space-y-3">
                  {sessions.map((session) => (
                    <Link
                      key={session.id}
                      to={`/children/${childProfileId}/counseling/${session.id}`}
                      className="group block rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#a8623e]/30"
                    >
                      <Card className="border-[#eadfd8] bg-white py-0 transition group-hover:-translate-y-0.5 group-hover:shadow-md">
                        <CardContent className="grid grid-cols-[auto_1fr_auto] items-center gap-4 p-4 sm:p-5">
                          <span className="grid size-12 place-items-center rounded-xl bg-[#f5e8dd] text-[#a8623e]">
                            <BookOpenText className="size-5" />
                          </span>
                          <span className="min-w-0">
                            <span className="text-xs text-[#8b786e]">{formatDate(session.date)}</span>
                            <strong className="mt-1 block truncate text-sm sm:text-base">{session.title}</strong>
                            <span className="mt-1 hidden truncate text-xs text-[#79685f] sm:block">{session.content}</span>
                          </span>
                          <span className="flex items-center gap-1 text-xs font-semibold text-[#865039]">
                            <span className="hidden sm:inline">기록 보기</span>
                            <ChevronRight className="size-4 transition group-hover:translate-x-0.5" />
                          </span>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : !sessionsError ? (
                <Card className="mt-5 border-dashed border-[#d8bca9] bg-white/70">
                  <CardContent className="flex flex-col items-center px-5 py-10 text-center">
                    <span className="grid size-12 place-items-center rounded-full bg-[#f5e8dd] text-[#a8623e]">
                      <NotebookTabs className="size-5" />
                    </span>
                    <strong className="mt-4">아직 상담 기록이 없어요</strong>
                    <p className="mt-2 text-sm text-[#79685f]">첫 번째 상황을 남기면 이곳에 기록이 쌓여요.</p>
                    <Button variant="outline" className="mt-5" onClick={() => setIsCreateOpen(true)}>
                      <Plus /> 첫 이야기 작성하기
                    </Button>
                  </CardContent>
                </Card>
              ) : null}

              {hasNext && (
                <div className="mt-5 text-center">
                  <Button variant="outline" onClick={() => void setSize(size + 1)}>
                    기록 더 보기
                  </Button>
                </div>
              )}
            </section>

            <nav className="mt-10 grid grid-cols-3 border-t border-[#eadfd8] pt-4 text-center text-xs text-[#79685f] lg:hidden" aria-label="모바일 아이 공간 메뉴">
              <span className="flex flex-col items-center gap-1 font-semibold text-[#75432f]"><Home className="size-5" />오늘</span>
              <span className="flex flex-col items-center gap-1"><NotebookTabs className="size-5" />기록</span>
              <span className="flex flex-col items-center gap-1"><Compass className="size-5" />길잡이</span>
            </nav>
          </section>
        </div>
      </div>

      <Dialog open={isCreateOpen} onOpenChange={(open) => !isMutating && setIsCreateOpen(open)}>
        <DialogContent className="max-h-[calc(100svh-2rem)] overflow-y-auto border-[#eadfd8] bg-[#fffdfb] sm:max-w-lg">
          <DialogHeader>
            <span className="text-xs font-bold tracking-[.14em] text-[#a8623e] uppercase">새로운 상담</span>
            <DialogTitle className="text-3xl tracking-[-.05em] text-[#342721]">어떤 일이 있었나요?</DialogTitle>
            <DialogDescription className="text-[#79685f]">상황을 편하게 적어주시면 {child.name}이에게 맞는 상담을 준비할게요.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleCreate}>
            <div className="space-y-2">
              <Label htmlFor="counseling-title">상황 제목</Label>
              <Input id="counseling-title" name="title" maxLength={200} required className="h-11 bg-white" placeholder="예: 학원 숙제 때문에 갈등이 생겼어요" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="counseling-content">자세한 내용</Label>
              <Textarea id="counseling-content" name="content" required className="min-h-36 bg-white" placeholder="오늘 있었던 상황과 서로 나눈 말을 편하게 적어주세요." />
            </div>
            {createError && (
              <Alert variant="destructive">
                <AlertCircle />
                <AlertDescription>{createError}</AlertDescription>
              </Alert>
            )}
            <DialogFooter className="-mx-4 -mb-4 mt-5">
              <Button type="button" variant="outline" disabled={isMutating} onClick={() => setIsCreateOpen(false)}>취소</Button>
              <Button type="submit" disabled={isMutating} className="bg-[#75432f] text-white hover:bg-[#5f3525]">
                {isMutating ? "만드는 중..." : "상담 만들기"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function InvalidChildState({ message }: { message: string }) {
  return (
    <main className="grid min-h-svh place-items-center bg-[#fbf7f3] px-5 text-center text-[#342721]">
      <div>
        <AlertCircle className="mx-auto size-10 text-[#a8623e]" />
        <h1 className="mt-4 text-2xl font-bold">아이 공간을 열 수 없어요</h1>
        <p className="mt-2 text-sm text-[#79685f]">{message}</p>
        <Button asChild className="mt-6 bg-[#75432f] text-white">
          <Link to="/dashboard"><ArrowLeft /> 아이 선택으로 돌아가기</Link>
        </Button>
      </div>
    </main>
  );
}
