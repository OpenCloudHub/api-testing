// tests/06-breakpoint/models/custom/wine.js
import { getCustomModelUrl } from '../../../../config/environments.js';
import { CUSTOM_MODEL_ENDPOINTS } from '../../../../config/endpoints.js';
import { buildOptions } from '../../../../config/thresholds.js';
import { postJson } from '../../../../helpers/http.js';
import { loadJsonData, randomSample } from '../../../../helpers/data.js';

const MODEL_NAME = 'wine';
const BASE_URL = getCustomModelUrl(MODEL_NAME);
const ENDPOINTS = CUSTOM_MODEL_ENDPOINTS;

export const options = buildOptions('breakpoint');

const testData = loadJsonData('wine-samples', '../../../../data/wine.json');

export function setup() {
  console.log('='.repeat(60));
  console.log(`🔥 Breakpoint Test: ${MODEL_NAME}`);
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`⏰ Started: ${new Date().toISOString()}`);
  console.log('='.repeat(60));
}

export default function () {
  if (testData.length === 0) return;

  const sample = randomSample(testData);
  const payload = { features: [sample.features] };

  postJson(`${BASE_URL}${ENDPOINTS.predict}`, payload, `${MODEL_NAME}-predict`);
}

export function teardown() {
  console.log('='.repeat(60));
  console.log(`✅ Breakpoint test completed for ${MODEL_NAME}`);
  console.log('='.repeat(60));
}
