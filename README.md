# 코코아 로그인·회원가입 프론트엔드

부모와 아이의 마음을 잇는 AI 육아 지원 서비스의 반응형 인증 화면입니다.

## VS Code에서 실행

1. 이 폴더를 VS Code로 엽니다.
2. 터미널에서 `npm install`을 실행합니다.
3. `npm run dev`를 실행합니다.
4. 브라우저에서 `http://localhost:5173`을 엽니다.

로그인은 `/`, 회원가입은 `/signup` 경로입니다.

인증 API 기본 주소는 `http://localhost:8080`이며 `.env`의 `VITE_API_BASE_URL`로 변경할 수 있습니다. Refresh Token은 HttpOnly 쿠키로 처리하고 Access Token은 프론트 메모리에서 관리합니다.

## 명령어

- `npm run dev`: 개발 서버 실행
- `npm run build`: 배포용 파일 생성
- `npm run start`: 빌드 결과 미리보기
- `npm run lint`: 코드 검사
