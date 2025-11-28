// tests/06-breakpoint/apps/demo-backend.js
import { ENV } from '../../../config/environments.js';
import { DEMO_BACKEND_ENDPOINTS } from '../../../config/endpoints.js';
import { buildOptions } from '../../../config/thresholds.js';
import { postJson } from '../../../helpers/http.js';
import { loadJsonData, randomSample } from '../../../helpers/data.js';

const APP_NAME = 'demo-backend';
const BASE_URL = ENV.apps['demo-backend'];
const ENDPOINTS = DEMO_BACKEND_ENDPOINTS;

export const options = buildOptions('breakpoint');

const testData = loadJsonData('rag-queries', '../../../data/rag-queries.json');

export function setup() {
  console.log('='.repeat(60));
  console.log(`🔥 Breakpoint Test: ${APP_NAME}`);
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`⏰ Started: ${new Date().toISOString()}`);
  console.log('='.repeat(60));
}

export default function () {
  if (testData.length === 0) return;

  const sample = randomSample(testData);
  const payload = {
    question: sample.question,
    stream: false,
  };

  postJson(
    `${BASE_URL}${ENDPOINTS.query}`,
    payload,
    `${APP_NAME}-query`,
    { timeout: '30s' }
  );
}

export function teardown() {
  console.log('='.repeat(60));
  console.log(`✅ Breakpoint test completed for ${APP_NAME}`);
  console.log('='.repeat(60));
}
