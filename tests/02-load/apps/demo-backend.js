// tests/02-load/apps/demo-backend.js
import { group, sleep } from 'k6';
import { ENV } from '../../../config/environments.js';
import { DEMO_BACKEND_ENDPOINTS } from '../../../config/endpoints.js';
import { buildOptions } from '../../../config/thresholds.js';
import { get, postJson, checkDuration } from '../../../helpers/http.js';
import { loadJsonData, randomSample } from '../../../helpers/data.js';

const APP_NAME = 'demo-backend';
const BASE_URL = ENV.apps['demo-backend'];
const ENDPOINTS = DEMO_BACKEND_ENDPOINTS;

export const options = buildOptions('load', {
  'http_req_duration{name:demo-backend-query}': ['p(95)<30000'],  // RAG is slow
});

const testData = loadJsonData('rag-queries', '../../../data/rag-queries.json');

export function setup() {
  console.log('='.repeat(60));
  console.log(`📊 Load Test: ${APP_NAME}`);
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`⏰ Started: ${new Date().toISOString()}`);
  console.log('='.repeat(60));

  // Verify service is healthy
  const healthRes = get(`${BASE_URL}${ENDPOINTS.health}`, `${APP_NAME}-health-check`);
  if (!healthRes.ok) {
    console.error('❌ Service not healthy, load test may fail');
  }
}

export default function () {
  // 10% health checks
  if (Math.random() < 0.1) {
    group('Health Check', () => {
      get(`${BASE_URL}${ENDPOINTS.health}`, `${APP_NAME}-health`);
    });
  }

  // 5% prompt info checks
  if (Math.random() < 0.05) {
    group('Prompt Info', () => {
      get(`${BASE_URL}${ENDPOINTS.prompt}`, `${APP_NAME}-prompt`);
    });
  }

  // 85% queries (main workload)
  group('RAG Queries', () => {
    if (testData.length === 0) return;

    const sample = randomSample(testData);
    const payload = {
      question: sample.question,
      stream: false,
    };

    const { response, ok } = postJson(
      `${BASE_URL}${ENDPOINTS.query}`,
      payload,
      `${APP_NAME}-query`,
      { timeout: '30s' }
    );

    if (ok) {
      checkDuration(response, `${APP_NAME}-query`, 30000);
    }
  });

  // Longer pause - RAG is resource intensive
  sleep(1 + Math.random() * 1);
}

export function teardown() {
  console.log('='.repeat(60));
  console.log(`✅ Load test completed for ${APP_NAME}`);
  console.log('='.repeat(60));
}
