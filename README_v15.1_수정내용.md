# Hawaii 2026 v15.1 수정 내용

## 수정 1: 번역 영어 자동 읽기
한국어→영어 번역이 끝난 뒤 영어 음성이 자동 재생되던 동작을 제거했습니다.
이제 `번역 영어 읽기` 버튼을 눌렀을 때만 음성이 재생됩니다.

## 수정 2: AI 여행 비서 JSON 오류
OpenAI Responses API의 `json_object` 형식을 사용할 때 프롬프트에 JSON 지시가 명시되도록 수정했습니다.

## 적용 방법
GitHub에서 다음 파일을 교체하세요.

- index.html
- sw.js

그리고 Supabase Edge Function의 코드를 사용하는 경우:
- supabase/functions/translate/index.ts 내용을 Supabase의 translate 함수에 다시 붙여넣고 Deploy

접속 주소:
https://passionyyj-ai.github.io/Hawaii-2026/index.html?v=15.1
