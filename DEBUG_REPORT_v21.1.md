# TravelMate AI v21.1 PWA 음성 통역 점검 결과

## 확인된 원인

- 일반 Safari 탭에서는 Web Speech API가 실행되지만 iPhone 홈 화면 standalone 환경에서는 시작 직후 실패합니다.
- 기존 코드는 standalone을 감지한 뒤 같은 PWA scope의 URL을 `target="_blank"`로 열었습니다.
- iOS는 같은 scope의 링크를 Safari 앱으로 강제 전환한다고 보장하지 않으므로, 버튼을 눌러도 홈 화면 웹앱 문맥이 유지될 수 있습니다.
- 저장소에는 `v21.js`가 있지만 실제 `index.html`은 `v20.js`를 로드합니다. 음성 우회 코드는 `index.html`의 v20.4 블록이 실제 실행 경로입니다.

## 적용한 변경

- standalone 판정을 `display-mode: standalone`과 `navigator.standalone`으로 유지했습니다.
- 홈 화면의 음성 버튼은 SpeechRecognition을 생성하거나 시작하지 않습니다.
- Safari 새 창 열기를 먼저 시도합니다.
- iOS가 Safari로 전환하지 않을 경우 항상 사용할 수 있도록 공유 메뉴와 URL 복사 fallback을 표시합니다.
- Safari용 URL은 `safariInterpreter=1#interpreter`로 통역 탭을 바로 엽니다.
- 서비스워커 캐시와 manifest/version을 v21.1로 올렸습니다.

## 검증

- Node.js 문법 검사: `v20.js`, `v21.js`, 인라인 script 15개 모두 통과.
- 로컬 HTTP 실행: 일반 페이지 로드 성공.
- standalone 모의 실행: 음성 버튼이 Safari용 버튼으로 전환됨.
- 버튼 클릭: Safari URL 생성과 fallback modal 표시 확인.
- fallback URL에서 `standaloneTest` 제거 확인.
- 서비스워커: HTML/JS/manifest/json은 network-first, 자동 reload/controllerchange/skipWaiting 없음.

## iPhone에서 확인할 항목

1. 홈 화면 앱의 통역 버튼을 누릅니다.
2. Safari가 열리면 그대로 음성 버튼을 사용합니다.
3. Safari가 열리지 않으면 표시된 화면에서 `공유 메뉴 열기`를 누릅니다.
4. `Safari에서 열기`가 없으면 `주소 복사` 후 Safari 주소창에 붙여넣습니다.

웹 페이지 JavaScript만으로 iOS의 Safari 앱을 강제로 실행하는 공식 API는 없습니다. 따라서 이 버전은 자동 전환을 시도하되, 실패해도 막히지 않는 사용자 경로를 보장합니다.
