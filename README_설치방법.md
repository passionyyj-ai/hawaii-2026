# Hawaii 2026 v13.1 Ultimate — Supabase 버전

## 구조
GitHub Pages → Supabase Edge Function → OpenAI API

Cloudflare에서 발생한 `Country, region, or territory not supported` 오류를 피하기 위해
GPT 요청 경로를 Supabase Edge Function으로 변경한 버전입니다.

## 1. Supabase Edge Function 만들기
1. Supabase Dashboard에 로그인합니다.
2. 프로젝트를 선택합니다.
3. 왼쪽 메뉴에서 **Edge Functions**를 엽니다.
4. **Create a new function**을 누릅니다.
5. 함수 이름을 `translate`로 입력합니다.
6. 기본 코드를 모두 지우고 아래 파일 내용을 붙여넣습니다.

`supabase/functions/translate/index.ts`

7. **Deploy function**을 누릅니다.

## 2. OpenAI API 키 저장
Supabase Dashboard에서:

**Edge Functions → Secrets**  
또는  
**Project Settings → Edge Functions → Secrets**

다음 Secret을 추가합니다.

- Name: `OPENAI_API_KEY`
- Value: OpenAI Platform에서 생성한 API Key

선택 사항:

- `OPENAI_MODEL` = `gpt-4.1-mini`
- `OPENAI_VISION_MODEL` = `gpt-4.1-mini`

## 3. JWT 검증 끄기
여행 앱은 로그인 없이 Edge Function을 호출하므로
`translate` 함수 설정에서 **Verify JWT**를 꺼야 합니다.

화면에 토글이 보이지 않으면 함수 생성 또는 배포 설정에서
`Verify JWT` 또는 `Enforce JWT verification` 항목을 비활성화합니다.

## 4. config.js 설정
Supabase Dashboard의 **Project Settings → API**에서 아래 값을 확인합니다.

- Project URL
- anon/public key

`config.js`를 다음처럼 수정합니다.

```javascript
window.HAWAII_CONFIG = {
  supabaseFunctionUrl: "https://프로젝트ID.supabase.co/functions/v1/translate",
  supabaseAnonKey: "SUPABASE_ANON_KEY"
};
```

OpenAI API 키는 절대로 `config.js`에 넣지 않습니다.

## 5. GitHub Pages 업로드
GitHub의 Hawaii-2026 저장소에서 다음 파일을 교체합니다.

- `index.html`
- `config.js`
- `sw.js`
- `README_설치방법.md`

아이콘과 `manifest.webmanifest`는 기존 파일을 그대로 사용해도 됩니다.

## 6. 테스트
아래 주소로 접속합니다.

`https://passionyyj-ai.github.io/Hawaii-2026/index.html?v=13.1`

통역 메뉴에서 한국어 문장을 말하거나 입력해 테스트합니다.

예:
`예약한 차량을 찾으러 왔습니다.`

정상 응답 예:
`I'm here to pick up the car I reserved.`

## v13.1 Ultimate 기능
- 한국어 ↔ 영어 GPT 문맥 통역
- 번역된 영어 자동 읽기
- 하와이 상황별 AI 여행 비서
- 바로 사용할 영어 문장과 다음 행동 추천
- 메뉴판·표지판·영수증 사진 번역
- OpenAI API 키를 Supabase Secret에 보관
