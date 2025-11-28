// tests/05-soak/models/custom/fashion-mnist.js
// Soak test - sustained load over extended period

import { group, sleep } from 'k6';
import { getCustomModelUrl } from '../../../../config/environments.js';
import { CUSTOM_MODEL_ENDPOINTS } from '../../../../config/endpoints.js';
import { buildOptions } from '../../../../config/thresholds.js';
import { get, postJson, checkDuration } from '../../../../helpers/http.js';
import { loadJsonData, randomSample } from '../../../../helpers/data.js';

const MODEL_NAME = 'fashion-mnist';
const BASE_URL = getCustomModelUrl(MODEL_NAME);
const ENDPOINTS = CUSTOM_MODEL_ENDPOINTS;

export const options = buildOptions('soak');

const testData = loadJsonData('fashion-mnist-samples', '../../../../data/fashion-mnist.json');

export function setup() {
  console.log('='.repeat(60));
  console.log(`🕐 Soak Test: ${MODEL_NAME}`);
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`⏰ Started: ${new Date().toISOString()}`);
  console.log('='.repeat(60));
}

export default function () {
  // Mix: 80% predictions, 20% health checks
  if (Math.random() < 0.2) {
    get(`${BASE_URL}${ENDPOINTS.health}`, `${MODEL_NAME}-health`);
  } else {
    if (testData.length === 0) return;

    const sample = randomSample(testData);
    const payload = { images: [sample] };

    const { response, ok } = postJson(
      `${BASE_URL}${ENDPOINTS.predict}`,
      payload,
      `${MODEL_NAME}-predict`
    );

    if (ok) {
      checkDuration(response, `${MODEL_NAME}-predict`, 3000);
    }
  }

  sleep(1 + Math.random() * 0.5);  // Steady pace for soak
}

export function teardown() {
  console.log('='.repeat(60));
  console.log(`✅ Soak test completed for ${MODEL_NAME}`);
  console.log('='.repeat(60));
}