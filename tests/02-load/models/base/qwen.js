// tests/02-load/models/base/qwen.js
import { group, sleep } from 'k6';
import { getBaseModelUrl } from '../../../../config/environments.js';
import { BASE_MODEL_ENDPOINTS } from '../../../../config/endpoints.js';
import { buildOptions } from '../../../../config/thresholds.js';
import { get, postJson, checkDuration } from '../../../../helpers/http.js';
import { loadJsonData, randomSample } from '../../../../helpers/data.js';

const MODEL_NAME = 'qwen-0.5b';
const BASE_URL = getBaseModelUrl(MODEL_NAME);
const ENDPOINTS = BASE_MODEL_ENDPOINTS;

export const options = buildOptions('load', {
  'http_req_duration{name:qwen-0.5b-chat}': ['p(95)<15000'],  // LLMs need more time
});

const testData = loadJsonData('qwen-prompts', '../../../../data/qwen-prompts.json');

export function setup() {
  console.log('='.repeat(60));
  console.log(`📊 Load Test: ${MODEL_NAME}`);
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`⏰ Started: ${new Date().toISOString()}`);
  console.log('='.repeat(60));

  // Verify service is up
  const modelsRes = get(`${BASE_URL}${ENDPOINTS.models}`, `${MODEL_NAME}-models-check`);
  if (!modelsRes.ok) {
    console.error('❌ Service not healthy, load test may fail');
  }
}

export default function () {
  // 5% model list checks
  if (Math.random() < 0.05) {
    group('Models Check', () => {
      get(`${BASE_URL}${ENDPOINTS.models}`, `${MODEL_NAME}-models`);
    });
  }

  // 95% chat completions
  group('Chat Completions', () => {
    if (testData.length === 0) return;

    const sample = randomSample(testData);
    const payload = {
      model: MODEL_NAME,
      messages: sample.messages,
      max_tokens: 50,
      temperature: 0.7,
    };

    const { response, ok } = postJson(
      `${BASE_URL}${ENDPOINTS.chat}`,
      payload,
      `${MODEL_NAME}-chat`
    );

    if (ok) {
      checkDuration(response, `${MODEL_NAME}-chat`, 15000);
    }
  });

  // LLMs need longer pause between requests
  sleep(0.5 + Math.random() * 0.5);
}

export function teardown() {
  console.log('='.repeat(60));
  console.log(`✅ Load test completed for ${MODEL_NAME}`);
  console.log('='.repeat(60));
}
