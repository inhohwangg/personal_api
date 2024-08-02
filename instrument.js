const Sentry = require("@sentry/node");
const { nodeProfilingIntegration } = require("@sentry/profiling-node");

Sentry.init({
  dsn: "https://39a1114c70f660a0dc861d6dcc96e6da@o4507695041609728.ingest.us.sentry.io/4507695046721536",
  integrations: [nodeProfilingIntegration()],
  tracesSampleRate: 1.0, // 트랜잭션의 100%를 캡처
  profilesSampleRate: 1.0, // 트레이스 샘플 비율에 대한 프로파일링 샘플 비율 설정
  //test
});