// tests/01-smoke/apps/demo-backend.js
import http from 'k6/http';
import { group, sleep } from 'k6';
import { ENV } from '../../../config/environments.js';
import { buildOptions } from '../../../config/thresholds.js';
import { checkHealth, checkStatus, checkJsonField } from '../../../helpers/checks.js';

const TEST_TYPE = 'soak';
const TEST_TARGET = 'app-backend';

const BACKEND = ENV.apps['demo-backend'];

export const options = buildOptions(TEST_TYPE, TEST_TARGET, {
  'backend-health': {
    exec: 'testHealth',
  },
  'backend-api': {
    exec: 'testApi',
  },
}, {
  'http_req_duration{scenario:backend-health}': ['p(95)<2000'],
  'http_req_duration{scenario:backend-api}': ['p(95)<5000'],
});

export function testHealth() {
  group('backend-health', () => {
    let res = http.get(`${BACKEND}/api/health`, { tags: { name: 'backend-health' } });
    checkHealth(res, 'backend-health');

    res = http.get(`${BACKEND}/api/`, { tags: { name: 'backend-root' } });
    checkStatus(res, 'backend-root', 200);
  });
  sleep(0.5);
}

export function testApi() {
  group('backend-api', () => {
    // Test prompt endpoint
    const res = http.post(`${BACKEND}/api/prompt`, JSON.stringify({
      query: 'What is MLOps?',
    }), {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'backend-prompt' },
    });
    checkStatus(res, 'backend-prompt', 200);
  });
  sleep(0.5);
}

export default function () {
  testHealth();
  testApi();
}