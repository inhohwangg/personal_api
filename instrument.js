const Sentry = require("@sentry/node");
const { nodeProfilingIntegration } = require("@sentry/profiling-node");
require('dotenv').config({ path: '../../.env.dev' })

Sentry.init({
  dsn: process.env.SENTRY_URL,
  integrations: [nodeProfilingIntegration()],
  tracesSampleRate: 1.0, // 트랜잭션의 100%를 캡처
  profilesSampleRate: 1.0, // 트레이스 샘플 비율에 대한 프로파일링 샘플 비율 설정,
  //test
});