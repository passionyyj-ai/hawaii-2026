# TravelMate AI v20.1

## iPhone/Android 음성 인식 안정화

- iPhone Safari의 예기치 않은 `aborted` 종료를 오류로 표시하지 않음
- 결과 없이 종료될 때 최대 4회 자동 재시도
- 실제 문장이 인식되면 정상 종료하고 대화 기록 저장
- 마이크 권한, 네트워크, 오디오 캡처 오류를 구분해 안내
- 중복 SpeechRecognition 세션과 빠른 버튼 전환 충돌 방지
- 화면 전환·백그라운드 이동 시 안전하게 종료

기존 v20 일정 공유, Supabase, 첨부파일, 일정 CRUD 기능은 유지됩니다.
