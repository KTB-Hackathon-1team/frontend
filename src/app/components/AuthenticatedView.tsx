import { FormEvent, useEffect, useState } from "react";
import { AlertCircle, ArrowRight, Check, Info, LogOut, Plus } from "lucide-react";
import { useNavigate } from "react-router";
import useSWR, { useSWRConfig } from "swr";
import useSWRMutation from "swr/mutation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ApiError, logoutRequest } from "../../auth/authApi";
import {
  ChildGender,
  ChildProfile,
  CreateChildInput,
  createChild,
  uploadChildProfileImage,
} from "../../children/childrenApi";
import { useAuthStore } from "../../stores/authStore";
import { Brand } from "./Brand";

const CHILDREN_KEY = "/api/children";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

type RegisterChildArg = {
  input: CreateChildInput;
  image?: File;
};

type RegisterChildResult = {
  profile: ChildProfile;
  imageUploadFailed: boolean;
};

async function registerChildMutation(_: string, { arg }: { arg: RegisterChildArg }): Promise<RegisterChildResult> {
  const created = await createChild(arg.input);
  if (!arg.image) return { profile: created, imageUploadFailed: false };
  try {
    return {
      profile: await uploadChildProfileImage(created.id, arg.image),
      imageUploadFailed: false,
    };
  } catch {
    return { profile: created, imageUploadFailed: true };
  }
}

function getAge(birthDate: string) {
  const today = new Date();
  const birth = new Date(`${birthDate}T00:00:00`);
  let age = today.getFullYear() - birth.getFullYear();
  if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age -= 1;
  return Math.max(age, 0);
}

function getErrorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";
}

export function AuthenticatedView() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const selectedChildId = useAuthStore((state) => state.selectedChildId);
  const selectChild = useAuthStore((state) => state.selectChild);
  const { mutate: mutateAll } = useSWRConfig();
  const { data: children = [], error, isLoading, mutate } = useSWR<ChildProfile[], ApiError>(CHILDREN_KEY, {
    refreshInterval: 9 * 60 * 1000,
  });
  const { trigger: registerChild, isMutating } = useSWRMutation<RegisterChildResult, ApiError, string, RegisterChildArg>(CHILDREN_KEY, registerChildMutation);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [gender, setGender] = useState<ChildGender | "">("");
  const [registerError, setRegisterError] = useState("");
  const [notice, setNotice] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (children.length && !children.some((child) => child.id === selectedChildId)) {
      selectChild(children[0].id);
    }
  }, [children, selectChild, selectedChildId]);

  if (!user) return null;
  const selectedChild = children.find((child) => child.id === selectedChildId) ?? null;

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRegisterError("");
    setNotice("");
    const form = event.currentTarget;
    const formData = new FormData(form);
    const rawImage = formData.get("profileImage");
    const image = rawImage instanceof File && rawImage.size > 0 ? rawImage : undefined;

    if (!gender) {
      setRegisterError("성별을 선택해 주세요.");
      return;
    }
    if (image && !ALLOWED_IMAGE_TYPES.includes(image.type)) {
      setRegisterError("프로필 사진은 JPEG, PNG, WebP 형식만 사용할 수 있어요.");
      return;
    }
    if (image && image.size > MAX_IMAGE_SIZE) {
      setRegisterError("프로필 사진은 5MB 이하로 선택해 주세요.");
      return;
    }

    try {
      const result = await registerChild({
        input: {
          name: String(formData.get("name") ?? "").trim(),
          birthDate: String(formData.get("birthDate") ?? ""),
          gender,
        },
        image,
      });
      if (!result) return;
      await mutate((current = []) => [...current.filter((child) => child.id !== result.profile.id), result.profile], { revalidate: false });
      selectChild(result.profile.id);
      setNotice(result.imageUploadFailed
        ? `${result.profile.name}이 등록되었지만 사진은 업로드하지 못했어요.`
        : `${result.profile.name}이 새로 등록되고 선택되었어요.`);
      form.reset();
      setGender("");
      setIsDialogOpen(false);
    } catch (mutationError) {
      setRegisterError(getErrorMessage(mutationError));
    }
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logoutRequest();
      await mutateAll(() => true, undefined, { revalidate: false });
      navigate("/login", { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <main className="min-h-svh bg-[radial-gradient(circle_at_50%_16%,#fff0df_0,transparent_30%),#fbf7f3] text-[#342721]">
      <header className="grid min-h-18 grid-cols-[1fr_auto] items-center gap-6 border-b border-[#eadfd8] bg-white/90 px-5 backdrop-blur lg:grid-cols-[1fr_auto_1fr] lg:px-[clamp(24px,5vw,72px)]">
        <Brand />
        <nav className="hidden items-center gap-7 text-sm text-[#79685f] lg:flex" aria-label="주요 메뉴"><span className="font-bold text-[#75432f]">아이 선택</span><span>육아 길잡이</span><span>대화 기록</span></nav>
        <div className="flex items-center justify-end gap-2"><span className="hidden rounded-full bg-[#f5e8dd] px-3 py-2 text-xs text-[#6f5f57] sm:inline">{user.nickname} 부모님</span><Button variant="ghost" size="sm" onClick={handleLogout} disabled={isLoggingOut}><LogOut />{isLoggingOut ? "로그아웃 중" : "로그아웃"}</Button></div>
      </header>

      <section className="mx-auto w-full max-w-6xl px-4 py-12 text-center sm:px-6 lg:py-20" aria-labelledby="child-picker-title">
        <span className="text-xs font-bold tracking-[.14em] text-[#a8623e] uppercase">우리 가족 프로필</span>
        <h1 className="mt-3 text-4xl font-bold tracking-[-.06em] sm:text-5xl" id="child-picker-title">누구와 함께 시작할까요?</h1>
        <p className="mt-4 text-[#79685f]">아이를 선택하면 코코아가 마음에 맞는 대화를 준비할게요.</p>

        {error && <Alert className="mx-auto mt-7 max-w-2xl border-[#efd7c8] bg-[#fff5ed] text-left text-[#8b523a]"><AlertCircle /><AlertDescription><strong className="block">{error.message}</strong><span className="text-xs text-[#94776a]">목록 조회 API가 준비되지 않았더라도 새 아이는 등록할 수 있어요.</span></AlertDescription></Alert>}

        {isLoading ? (
          <div className="grid min-h-72 place-items-center text-sm text-[#79685f]" aria-live="polite">아이 프로필을 불러오는 중...</div>
        ) : (
          <>
            <div className="mt-10 grid grid-cols-2 justify-center gap-5 sm:grid-cols-[repeat(auto-fit,minmax(150px,180px))] sm:gap-8" aria-label="아이 프로필 목록">
              {children.map((child, index) => {
                const selected = child.id === selectedChildId;
                const tones = ["bg-[#f2cdb8] text-[#78472f]", "bg-[#dce9d3] text-[#4e6843]", "bg-[#f3dfaa] text-[#765e2e]", "bg-[#d8e6e9] text-[#49636c]"];
                return (
                  <button className="group relative min-w-0 text-center" type="button" key={child.id} aria-pressed={selected} onClick={() => { selectChild(child.id); setNotice(""); }}>
                    <Card className={`relative aspect-square overflow-hidden border-2 p-0 transition duration-200 group-hover:-translate-y-1 group-hover:shadow-xl ${selected ? "border-[#75432f] shadow-xl shadow-[#75432f]/15" : "border-transparent shadow-md shadow-[#75432f]/5"}`}>
                      {selected && <span className="absolute top-2 right-2 z-10 grid size-7 place-items-center rounded-full bg-[#75432f] text-white"><Check className="size-4" /></span>}
                      <Avatar className="size-full rounded-none" size="lg"><AvatarImage className="rounded-none" src={child.profileImageUrl ?? undefined} alt={`${child.name} 프로필`} /><AvatarFallback className={`rounded-none text-5xl font-black ${tones[index % tones.length]}`}>{child.name.slice(0, 1)}</AvatarFallback></Avatar>
                    </Card>
                    <strong className="mt-3 block text-base">{child.name}</strong><small className="mt-1 block text-xs text-[#79685f]">만 {getAge(child.birthDate)}세 · {child.gender === "MALE" ? "남아" : "여아"}</small>
                  </button>
                );
              })}

              <button className="group min-w-0 text-center" type="button" onClick={() => { setRegisterError(""); setIsDialogOpen(true); }}>
                <Card className="grid aspect-square place-items-center border-2 border-dashed border-[#caa993] bg-white/70 p-0 transition group-hover:-translate-y-1 group-hover:border-[#a8623e] group-hover:shadow-lg"><span className="grid size-14 place-items-center rounded-full bg-[#f8eae1] text-[#a8623e]"><Plus className="size-7" /></span></Card>
                <strong className="mt-3 block text-base">아이 등록</strong><small className="mt-1 block text-xs text-[#79685f]">새 프로필 추가</small>
              </button>
            </div>

            {!children.length && !error && <p className="mt-6 text-sm text-[#79685f]">아직 등록된 아이가 없어요. 아이 등록 카드를 눌러 시작해 주세요.</p>}

            <Card className="mx-auto mt-10 max-w-2xl border-[#eadfd8] bg-white/80"><CardContent className="flex flex-col items-center justify-between gap-4 p-5 sm:flex-row"><span className="text-sm text-[#79685f]">{selectedChild ? <><strong className="text-[#a8623e]">{selectedChild.name}</strong>이를 선택했어요</> : "먼저 아이를 선택해 주세요"}</span><Button className="h-11 min-w-52 bg-gradient-to-r from-[#a8623e] to-[#75432f] text-white" disabled={!selectedChild} onClick={() => selectedChild && setNotice(`${selectedChild.name}이 프로필을 선택했어요. 이제 대화를 시작할 수 있어요.`)}>{selectedChild ? `${selectedChild.name}이와 시작하기` : "아이 선택하기"}<ArrowRight /></Button></CardContent></Card>
            {notice && <Alert className="mx-auto mt-4 max-w-2xl border-[#ead8cc] bg-[#fff7f1] text-left text-[#80503b]"><Info /><AlertDescription>{notice}</AlertDescription></Alert>}
          </>
        )}
      </section>

      <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!isMutating) setIsDialogOpen(open); }}>
        <DialogContent className="max-h-[calc(100svh-2rem)] overflow-y-auto border-[#eadfd8] bg-[#fffdfb] sm:max-w-lg">
          <DialogHeader><span className="text-xs font-bold tracking-[.14em] text-[#a8623e] uppercase">새 프로필</span><DialogTitle className="text-3xl tracking-[-.05em] text-[#342721]">아이 등록</DialogTitle><DialogDescription className="text-[#79685f]">아이에게 맞는 대화를 준비할 수 있도록 알려주세요.</DialogDescription></DialogHeader>
          <form className="space-y-4" onSubmit={handleRegister}>
            <div className="space-y-2"><Label htmlFor="child-name">이름</Label><Input id="child-name" name="name" maxLength={30} placeholder="예: 민준" required className="h-11 bg-white" /></div>
            <div className="space-y-2"><Label htmlFor="child-birth-date">생년월일</Label><Input id="child-birth-date" name="birthDate" type="date" max={new Date().toISOString().slice(0, 10)} required className="h-11 bg-white" /></div>
            <div className="space-y-2"><Label>성별</Label><Select value={gender} onValueChange={(value) => setGender(value as ChildGender)} required><SelectTrigger className="h-11 w-full bg-white"><SelectValue placeholder="선택해 주세요" /></SelectTrigger><SelectContent><SelectItem value="MALE">남아</SelectItem><SelectItem value="FEMALE">여아</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label htmlFor="child-image">프로필 사진 <span className="font-normal text-[#79685f]">(선택)</span></Label><Input id="child-image" name="profileImage" type="file" accept="image/jpeg,image/png,image/webp" className="h-auto bg-white py-2" /></div>
            <Alert className="border-[#ead8cc] bg-[#fff7f1] text-[#866b5e]"><Info /><AlertDescription>JPEG, PNG, WebP 파일을 최대 5MB까지 등록할 수 있어요. 아이 생성 후 사진이 이어서 업로드됩니다.</AlertDescription></Alert>
            {registerError && <Alert variant="destructive"><AlertCircle /><AlertDescription>{registerError}</AlertDescription></Alert>}
            <DialogFooter className="-mx-4 -mb-4 mt-5"><Button type="button" variant="outline" disabled={isMutating} onClick={() => setIsDialogOpen(false)}>취소</Button><Button type="submit" disabled={isMutating} className="bg-[#75432f] text-white hover:bg-[#5f3525]">{isMutating ? "등록하는 중..." : "등록하기"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
