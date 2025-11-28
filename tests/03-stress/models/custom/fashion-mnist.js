// tests/03-stress/models/custom/fashion-mnist.js
// Stress test - push beyond normal load

import { group, sleep } from 'k6';
import { getCustomModelUrl } from '../../../../config/environments.js';
import { CUSTOM_MODEL_ENDPOINTS } from '../../../../config/endpoints.js';
import { buildOptions } from '../../../../config/thresholds.js';
import { postJson, healthCheck } from '../../../../helpers/http.js';
import { loadJsonData, randomSample } from '../../../../helpers/data.js';

const MODEL_NAME = 'fashion-mnist';
const BASE_URL = getCustomModelUrl(MODEL_NAME);
const ENDPOINTS = CUSTOM_MODEL_ENDPOINTS;

export const options = buildOptions('stress');

const testData = loadJsonData('fashion-mnist-samples', '../../../../data/fashion-mnist.json');

export function setup() {
  console.log('='.repeat(60));
  console.log(`💪 Stress Test: ${MODEL_NAME}`);
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`⏰ Started: ${new Date().toISOString()}`);
  console.log('='.repeat(60));
}

export default function () {
  if (testData.length === 0) return;

  const sample = randomSample(testData);
  const payload = { images: [sample] };

  postJson(`${BASE_URL}${ENDPOINTS.predict}`, payload, `${MODEL_NAME}-predict`);

  sleep(0.05 + Math.random() * 0.05);  // Minimal pause
}

export function teardown() {
  console.log('='.repeat(60));
  console.log(`✅ Stress test completed for ${MODEL_NAME}`);
  console.log('='.repeat(60));
}