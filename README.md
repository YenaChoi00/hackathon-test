# Toy Project

AI를 활용한 코드 제안 및 변경 시스템

## 프로젝트 구조

- `service-app/`: 메인 서비스 애플리케이션
  - AI 코드 제안 기능
  - iframe을 통한 앱 통합
  - GitHub PR 생성 기능

- `gas-app/`: iframe으로 통합되는 데모 앱
  - 실시간 코드 변경 적용
  - 메시지 통신 기능

## 시작하기

1. 서비스 앱 실행:
```bash
cd service-app
npm install
npm start
```

2. Gas 앱 실행:
```bash
cd gas-app
npm install
PORT=3001 npm start
```

## 환경 변수 설정

`.env` 파일을 각 앱 디렉토리에 생성하고 다음 값들을 설정하세요:

### service-app/.env
```
REACT_APP_GITHUB_TOKEN=your_github_token
```

## 주요 기능

- Claude API를 활용한 코드 제안
- GitHub PR 자동 생성
- iframe 통합 및 실시간 코드 변경
- 양방향 앱 통신
