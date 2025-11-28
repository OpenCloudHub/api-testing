// tests/02-load/models/custom/wine.js
import { group, sleep } from 'k6';
import { getCustomModelUrl } from '../../../../config/environments.js';
import { CUSTOM_MODEL_ENDPOINTS } from '../../../../config/endpoints.js';
import { buildOptions } from '../../../../config/thresholds.js';
import { get, postJson, checkDuration } from '../../../../helpers/http.js';
import { loadJsonData, randomSample } from '../../../../helpers/data.js';

const MODEL_NAME = 'wine';
const BASE_URL = getCustomModelUrl(MODEL_NAME);
const ENDPOINTS = CUSTOM_MODEL_ENDPOINTS;

export const options = buildOptions('load', {
  'http_req_duration{name:wine-predict}': ['p(95)<2500'],
});

const testData = loadJsonData('wine-samples', '../../../../data/wine.json');

export function setup() {
  console.log('='.repeat(60));
  console.log(`📊 Load Test: ${MODEL_NAME}`);
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`⏰ Started: ${new Date().toISOString()}`);
  console.log('='.repeat(60));

  const healthRes = get(`${BASE_URL}${ENDPOINTS.health}`, `${MODEL_NAME}-health-check`);
  if (!healthRes.ok) {
    console.error('❌ Service not healthy, load test may fail');
  }
}

export default function () {
  if (Math.random() < 0.1) {
    group('Health Check', () => {
      get(`${BASE_URL}${ENDPOINTS.health}`, `${MODEL_NAME}-health`);
    });
  }

  group('Predictions', () => {
    if (testData.length === 0) return;

    const sample = randomSample(testData);
    const payload = { features: [sample.features] };

    const { response, ok } = postJson(
      `${BASE_URL}${ENDPOINTS.predict}`,
      payload,
      `${MODEL_NAME}-predict`
    );

    if (ok) {
      checkDuration(response, `${MODEL_NAME}-predict`, 2500);
    }
  });

  sleep(0.1 + Math.random() * 0.2);
}

export function teardown() {
  console.log('='.repeat(60));
  console.log(`✅ Load test completed for ${MODEL_NAME}`);
  console.log('='.repeat(60));
}
