# TravelMate AI v22.0 — 홈 화면 음성인식

## 원인

참고 앱은 iPhone 홈 화면에서 Web Speech API만 사용하지 않습니다. `getUserMedia`로 음성을 녹음하고 16kHz mono WAV로 만든 뒤 Supabase Edge Function의 OpenAI transcription으로 텍스트를 받습니다.

## 적용

- iPhone·iPad·Android·홈 화면 모드에서는 PCM WAV 녹음 방식 사용
- 첫 번째 클릭: 녹음 시작
- 두 번째 클릭: 녹음 종료 및 서버 음성인식
- 영어와 한국어 언어 코드 분리
- 음성인식 결과를 기존 자동 GPT 번역 흐름에 연결
- 화면이 숨겨지거나 앱이 종료되면 마이크 트랙 해제
- 일반 데스크톱 Safari/Chrome에서는 기존 SpeechRecognition 유지
- 참고 앱에서 동작 중인 `travelmate-translate` Edge Function 사용

## 검증

- 참고 앱의 실제 녹음·transcribe 실행 경로 확인
- Supabase `travelmate-translate` 연결 및 번역 응답 확인
- standalone 모의 화면에서 녹음 버튼과 안내 문구 확인
- 이전 Safari 전환 안내가 제거된 것을 확인
- 브라우저 콘솔 오류 0건

실제 iPhone에서는 최초 실행 시 마이크 권한을 허용해야 하며, 녹음 후 텍스트 변환에는 인터넷 연결이 필요합니다.
