import { FormEvent, useEffect, useRef, useState } from "react";
import { ApiError } from "../../src/auth/authApi";
import { useAuth } from "../../src/auth/AuthContext";
import {
  ChildGender,
  ChildProfile,
  createChild,
  getChildren,
  uploadChildProfileImage,
} from "../../src/children/childrenApi";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function getAge(birthDate: string) {
  const today = new Date();
  const birth = new Date(`${birthDate}T00:00:00`);
  let age = today.getFullYear() - birth.getFullYear();
  const birthdayPassed = today.getMonth() > birth.getMonth()
    || (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
  if (!birthdayPassed) age -= 1;
  return Math.max(age, 0);
}

function getErrorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";
}

export function AuthenticatedView() {
  const { user, logout } = useAuth();
  const registerDialogRef = useRef<HTMLDialogElement>(null);
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [notice, setNotice] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    let active = true;
    getChildren()
      .then((profiles) => {
        if (!active) return;
        setChildren(profiles);
        setSelectedChildId((current) => current ?? profiles[0]?.id ?? null);
      })
      .catch((error) => {
        if (active) setLoadError(getErrorMessage(error));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (!user) return null;

  const selectedChild = children.find((child) => child.id === selectedChildId) ?? null;

  function openRegisterDialog() {
    setRegisterError("");
    registerDialogRef.current?.showModal();
  }

  function closeRegisterDialog() {
    if (!isRegistering) registerDialogRef.current?.close();
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRegisterError("");
    setNotice("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const image = formData.get("profileImage");

    if (image instanceof File && image.size > 0) {
      if (!ALLOWED_IMAGE_TYPES.includes(image.type)) {
        setRegisterError("프로필 사진은 JPEG, PNG, WebP 형식만 사용할 수 있어요.");
        return;
      }
      if (image.size > MAX_IMAGE_SIZE) {
        setRegisterError("프로필 사진은 5MB 이하로 선택해 주세요.");
        return;
      }
    }

    setIsRegistering(true);
    try {
      const created = await createChild({
        name: String(formData.get("name") ?? "").trim(),
        birthDate: String(formData.get("birthDate") ?? ""),
        gender: String(formData.get("gender") ?? "") as ChildGender,
      });

      let savedProfile = created;
      let imageUploadFailed = false;
      if (image instanceof File && image.size > 0) {
        try {
          savedProfile = await uploadChildProfileImage(created.id, image);
        } catch {
          imageUploadFailed = true;
        }
      }

      setChildren((current) => [...current.filter((child) => child.id !== savedProfile.id), savedProfile]);
      setSelectedChildId(savedProfile.id);
      setLoadError("");
      setNotice(imageUploadFailed
        ? `${savedProfile.name}이 등록되었지만 사진은 업로드하지 못했어요.`
        : `${savedProfile.name}이 새로 등록되고 선택되었어요.`);
      form.reset();
      registerDialogRef.current?.close();
    } catch (error) {
      setRegisterError(getErrorMessage(error));
    } finally {
      setIsRegistering(false);
    }
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  }

  function confirmSelection() {
    if (selectedChild) setNotice(`${selectedChild.name}이 프로필을 선택했어요. 이제 대화를 시작할 수 있어요.`);
  }

  return (
    <main className="child-picker-page">
      <header className="child-picker-header">
        <a className="brand" href="/" aria-label="코코아 홈"><span className="brand-symbol" aria-hidden="true"><i /><b /></span><span>코코아</span></a>
        <nav className="child-picker-nav" aria-label="주요 메뉴"><span className="active">아이 선택</span><span>육아 길잡이</span><span>대화 기록</span></nav>
        <div className="parent-menu"><span>{user.nickname} 부모님</span><button type="button" onClick={handleLogout} disabled={isLoggingOut}>{isLoggingOut ? "로그아웃 중" : "로그아웃"}</button></div>
      </header>

      <section className="child-picker-content" aria-labelledby="child-picker-title">
        <span className="eyebrow accent">우리 가족 프로필</span>
        <h1 id="child-picker-title">누구와 함께 시작할까요?</h1>
        <p>아이를 선택하면 코코아가 마음에 맞는 대화를 준비할게요.</p>

        {isLoading ? (
          <div className="child-list-state" aria-live="polite">아이 프로필을 불러오는 중...</div>
        ) : (
          <>
            {loadError && <div className="child-list-message" role="status"><span>{loadError}</span><small>목록 조회 API가 준비되지 않았더라도 새 아이는 등록할 수 있어요.</small></div>}

            <div className="child-profile-grid" aria-label="아이 프로필 목록">
              {children.map((child, index) => {
                const isSelected = child.id === selectedChildId;
                return (
                  <button className="child-profile-card" type="button" key={child.id} aria-pressed={isSelected} onClick={() => { setSelectedChildId(child.id); setNotice(""); }}>
                    <span className="child-selected-check" aria-hidden="true">✓</span>
                    <span className={`child-avatar avatar-tone-${index % 4}`}>
                      {child.profileImageUrl ? <img src={child.profileImageUrl} alt={`${child.name} 프로필`} /> : <span aria-hidden="true">{child.name.slice(0, 1)}</span>}
                    </span>
                    <strong>{child.name}</strong>
                    <small>만 {getAge(child.birthDate)}세 · {child.gender === "MALE" ? "남아" : "여아"}</small>
                  </button>
                );
              })}

              <button className="child-profile-card add-child-card" type="button" onClick={openRegisterDialog}>
                <span className="child-avatar add-child-icon" aria-hidden="true">＋</span><strong>아이 등록</strong><small>새 프로필 추가</small>
              </button>
            </div>

            {children.length === 0 && !loadError && <p className="empty-child-copy">아직 등록된 아이가 없어요. 아이 등록 카드를 눌러 시작해 주세요.</p>}

            <div className="child-selection-footer">
              <span>{selectedChild ? `${selectedChild.name}이를 선택했어요` : "먼저 아이를 선택해 주세요"}</span>
              <button className="primary-button child-start-button" type="button" disabled={!selectedChild} onClick={confirmSelection}>{selectedChild ? `${selectedChild.name}이와 시작하기` : "아이 선택하기"}</button>
            </div>
            {notice && <p className="child-action-notice" role="status">{notice}</p>}
          </>
        )}
      </section>

      <dialog className="child-register-dialog" ref={registerDialogRef} onCancel={closeRegisterDialog}>
        <div className="child-register-heading">
          <div><span className="eyebrow accent">새 프로필</span><h2>아이 등록</h2><p>아이에게 맞는 대화를 준비할 수 있도록 알려주세요.</p></div>
          <button className="dialog-close-button" type="button" onClick={closeRegisterDialog} aria-label="아이 등록 창 닫기">×</button>
        </div>
        <form onSubmit={handleRegister}>
          <label className="field"><span>이름</span><input name="name" type="text" maxLength={30} placeholder="예: 민준" required /></label>
          <label className="field"><span>생년월일</span><input name="birthDate" type="date" max={new Date().toISOString().slice(0, 10)} required /></label>
          <label className="field"><span>성별</span><select name="gender" defaultValue="" required><option value="" disabled>선택해 주세요</option><option value="MALE">남아</option><option value="FEMALE">여아</option></select></label>
          <label className="field"><span>프로필 사진 <small>(선택)</small></span><input className="profile-image-input" name="profileImage" type="file" accept="image/jpeg,image/png,image/webp" /></label>
          <div className="profile-upload-note"><span aria-hidden="true">i</span><p>JPEG, PNG, WebP 파일을 최대 5MB까지 등록할 수 있어요. 아이 생성 후 사진이 이어서 업로드됩니다.</p></div>
          {registerError && <p className="form-message error" role="alert">{registerError}</p>}
          <div className="child-register-actions"><button className="secondary-button" type="button" onClick={closeRegisterDialog} disabled={isRegistering}>취소</button><button className="primary-button" type="submit" disabled={isRegistering}>{isRegistering ? "등록하는 중..." : "등록하기"}</button></div>
        </form>
      </dialog>
    </main>
  );
}
