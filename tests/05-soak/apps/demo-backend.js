// tests/05-soak/apps/demo-backend.js
import { sleep } from 'k6';
import { ENV } from '../../../config/environments.js';
import { DEMO_BACKEND_ENDPOINTS } from '../../../config/endpoints.js';
import { buildOptions } from '../../../config/thresholds.js';
import { get, postJson, checkDuration } from '../../../helpers/http.js';
import { loadJsonData, randomSample } from '../../../helpers/data.js';

const APP_NAME = 'demo-backend';
const BASE_URL = ENV.apps['demo-backend'];
const ENDPOINTS = DEMO_BACKEND_ENDPOINTS;

export const options = buildOptions('soak');

const testData = loadJsonData('rag-queries', '../../../data/rag-queries.json');

export function setup() {
  console.log('='.repeat(60));
  console.log(`🕐 Soak Test: ${APP_NAME}`);
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`⏰ Started: ${new Date().toISOString()}`);
  console.log('='.repeat(60));
}

export default function () {
  // 15% health checks
  if (Math.random() < 0.15) {
    get(`${BASE_URL}${ENDPOINTS.health}`, `${APP_NAME}-health`);
  }
  // 5% prompt info
  else if (Math.random() < 0.05) {
    get(`${BASE_URL}${ENDPOINTS.prompt}`, `${APP_NAME}-prompt`);
  }
  // 80% queries
  else {
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
  }

  sleep(2 + Math.random() * 1);  // Steady pace for soak
}

export function teardown() {
  console.log('='.repeat(60));
  console.log(`✅ Soak test completed for ${APP_NAME}`);
  console.log('='.repeat(60));
}
