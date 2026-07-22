# v21 배포 순서

1. Supabase Dashboard의 SQL Editor에서 `supabase_setup.sql` 전체를 한 번 실행합니다.
2. 이 폴더의 내용물을 GitHub 저장소 `Hawaii-2026` 루트에 업로드합니다. 상위 폴더 자체가 아니라 `index.html`이 저장소 루트에 있어야 합니다.
3. GitHub Pages 배포가 끝난 뒤 앱과 Safari 탭을 완전히 종료하고 다시 엽니다.
4. `☁️ 여행 공유`에서 Project URL과 publishable/anon public key를 입력합니다.
5. 한 기기에서 여행을 생성하고, 다른 기기에서 표시된 `XXXX-XXXX` 코드를 입력합니다.
6. 기존 자료가 있는 기기에서만 `기존 일정·파일 이관`을 한 번 실행합니다.

`service_role` 또는 secret key는 앱에 입력하지 마세요.
