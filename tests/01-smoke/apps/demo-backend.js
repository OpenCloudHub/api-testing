// tests/01-smoke/apps/demo-backend.js
// Smoke test for Demo RAG Backend API
import { group } from 'k6';
import { ENV } from '../../../config/environments.js';
import { DEMO_BACKEND_ENDPOINTS } from '../../../config/endpoints.js';
import { buildOptions } from '../../../config/thresholds.js';
import { get, postJson, healthCheck, checkDuration, checkHasField } from '../../../helpers/http.js';
import { loadJsonData, sequentialSample } from '../../../helpers/data.js';

const APP_NAME = 'demo-backend';
const BASE_URL = ENV.apps['demo-backend'];
const ENDPOINTS = DEMO_BACKEND_ENDPOINTS;

export const options = buildOptions('smoke');

const testData = loadJsonData('rag-queries', '../../../data/rag-queries.json');

export function setup() {
  console.log('='.repeat(60));
  console.log(`🧪 Smoke Test: ${APP_NAME}`);
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`⏰ Started: ${new Date().toISOString()}`);
  console.log('='.repeat(60));

  return { baseUrl: BASE_URL };
}

export default function () {
  group('Root Endpoint', () => {
    const { response, ok } = get(`${BASE_URL}${ENDPOINTS.root}`, `${APP_NAME}-root`);
    if (ok) {
      checkHasField(response, `${APP_NAME}-root`, 'service');
      checkHasField(response, `${APP_NAME}-root`, 'version');
      checkHasField(response, `${APP_NAME}-root`, 'status');
      checkDuration(response, `${APP_NAME}-root`, 1000);
    }
  });

  group('Health Endpoint', () => {
    const { response, healthy } = healthCheck(`${BASE_URL}${ENDPOINTS.health}`, `${APP_NAME}-health`);
    if (healthy) {
      checkHasField(response, `${APP_NAME}-health`, 'status');
      checkHasField(response, `${APP_NAME}-health`, 'chain_loaded');
      checkDuration(response, `${APP_NAME}-health`, 1000);
    }
  });

  group('Prompt Info Endpoint', () => {
    const { response, ok } = get(`${BASE_URL}${ENDPOINTS.prompt}`, `${APP_NAME}-prompt`);
    if (ok) {
      checkHasField(response, `${APP_NAME}-prompt`, 'prompt_name');
      checkHasField(response, `${APP_NAME}-prompt`, 'prompt_version');
      checkHasField(response, `${APP_NAME}-prompt`, 'prompt_template');
      checkDuration(response, `${APP_NAME}-prompt`, 1000);
    }
  });

  group('API Docs', () => {
    const { response, ok } = get(`${BASE_URL}${ENDPOINTS.docs}`, `${APP_NAME}-docs`);
    if (ok) {
      checkDuration(response, `${APP_NAME}-docs`, 2000);
    }
  });

  group('Query Endpoint (non-streaming)', () => {
    if (testData.length === 0) {
      console.warn('⚠️ No test data loaded, skipping query test');
      return;
    }

    const sample = sequentialSample(testData, __ITER);
    const payload = {
      question: sample.question,
      stream: false,
    };

    const { response, ok } = postJson(
      `${BASE_URL}${ENDPOINTS.query}`,
      payload,
      `${APP_NAME}-query`,
      { timeout: '30s' }  // RAG queries can be slow
    );

    if (ok) {
      checkHasField(response, `${APP_NAME}-query`, 'answer');
      checkHasField(response, `${APP_NAME}-query`, 'prompt_version');
      checkHasField(response, `${APP_NAME}-query`, 'processing_time_ms');
      checkDuration(response, `${APP_NAME}-query`, 30000);  // Allow up to 30s for RAG
    }
  });
}

export function teardown() {
  console.log('='.repeat(60));
  console.log(`✅ Smoke test completed for ${APP_NAME}`);
  console.log('='.repeat(60));
}
