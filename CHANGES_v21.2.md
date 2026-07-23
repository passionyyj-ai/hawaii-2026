# TravelMate AI v21.2

## 홈 화면 음성 통역

- iPhone 홈 화면 PWA에서 실패하던 같은 scope의 `target="_blank"` 호출을 제거했습니다.
- 홈 화면에서는 `SpeechRecognition`을 생성하거나 시작하지 않습니다.
- 음성 통역 버튼을 누르면 Safari용 주소가 즉시 표시됩니다.
- 사용자 클릭 시 Safari용 주소를 클립보드에 자동 복사합니다.
- 자동 복사가 차단되면 `주소 다시 복사`와 공유 메뉴를 사용할 수 있습니다.
- Safari에서 주소를 열면 통역 화면이 자동 선택됩니다.

## 버전과 캐시

- 앱 버전: 21.2
- 서비스워커 캐시: `travelmate-v21-2-pwa-safari-guide`
- 자동 reload, `controllerchange`, `skipWaiting`, `clients.claim`을 사용하지 않습니다.

## 검증 결과

- standalone 모의 분기에서 전용 버튼 확인
- 클릭 직후 안내창 표시 확인
- Safari용 URL과 통역 화면 파라미터 확인
- 주소 복사 fallback 버튼 확인
- 브라우저 콘솔 오류 0건
- ZIP 내부 `index.html`, `sw.js`, `manifest.webmanifest`, `version.json` 포함 여부 확인

웹 표준에는 PWA JavaScript가 iOS Safari 앱을 강제로 실행하는 API가 없습니다. 따라서 v21.2는 작동하지 않는 자동 전환을 약속하지 않고, Safari에서 확실히 열 수 있는 복사·공유 절차를 제공합니다.
