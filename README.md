# AI Code Suggestion

AI를 활용하여 코드 변경을 제안하고, GitHub PR을 자동으로 생성하는 시스템

## 기능

- 자연어로 코드 변경 요청
- Claude API를 통한 코드 제안
- GitHub PR 자동 생성 및 업데이트
- 실시간 코드 변경 미리보기 (iframe)

## 실행 방법

```bash
npm install         # concurrently 설치
npm run install:all # 의존성 설치
npm start          # 앱 실행 (service-app:3000, gas-app:3001)
```

## 환경 설정

### service-app/.env
```
# GitHub 설정
REACT_APP_GITHUB_OWNER=your_username
REACT_APP_GITHUB_REPO=your_repo
REACT_APP_GITHUB_TOKEN=your_github_token

# Claude API 설정
REACT_APP_CLAUDE_API_KEY=your_claude_api_key
```

## 프로젝트 구조

- `service-app/`: AI 코드 제안 & PR 생성
- `gas-app/`: 데모 앱 (코드 변경 대상)