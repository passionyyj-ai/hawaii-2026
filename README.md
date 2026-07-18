# Hawaii 2026 v14 Ultimate Fresh

깨끗하게 다시 구성한 Supabase 전용 최종 패키지입니다.

## GitHub에 올릴 파일

저장소를 비운 뒤 이 ZIP의 **모든 파일과 폴더**를 업로드해도 됩니다.
GitHub Pages 실행에 핵심적인 파일은 다음과 같습니다.

- index.html
- config.js
- sw.js
- manifest.webmanifest
- icon-192.png
- icon-512.png
- apple-touch-icon.png
- favicon.ico

`supabase/functions/translate/index.ts`는 Edge Function 유지보수용 백업입니다.

## 연결 구조

GitHub Pages → Supabase Edge Function → OpenAI API

함수 URL은 이미 다음 주소로 설정되어 있습니다.

`https://fjpczzjrzxsyqolwfebh.supabase.co/functions/v1/translate`

Supabase 함수의 Verify JWT가 OFF라면 `config.js`의 anon key는 빈 값으로 두어도 됩니다.

## 업로드 후 접속

`https://passionyyj-ai.github.io/Hawaii-2026/index.html?v=14.0`

처음 접속한 PC에서는 Ctrl+Shift+R로 강력 새로고침하세요.
iPhone에서 이전 앱을 설치했다면 기존 홈 화면 아이콘을 삭제한 뒤 Safari에서 다시 홈 화면에 추가하는 편이 안전합니다.

## 주요 수정

- Cloudflare 관련 코드 완전 제거
- Supabase 전용 통역/AI 비서 연결
- 페이지 ID 불일치와 classList null 오류 수정
- 통역 실패 시 실제 오류 메시지 표시
- v14 전용 PWA 캐시
- 새 하와이 앱 아이콘, Apple Touch Icon, Favicon 포함
