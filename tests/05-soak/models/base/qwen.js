// tests/05-soak/models/base/qwen.js
import { sleep } from 'k6';
import { getBaseModelUrl } from '../../../../config/environments.js';
import { BASE_MODEL_ENDPOINTS } from '../../../../config/endpoints.js';
import { buildOptions } from '../../../../config/thresholds.js';
import { get, postJson, checkDuration } from '../../../../helpers/http.js';
import { loadJsonData, randomSample } from '../../../../helpers/data.js';

const MODEL_NAME = 'qwen-0.5b';
const BASE_URL = getBaseModelUrl(MODEL_NAME);
const ENDPOINTS = BASE_MODEL_ENDPOINTS;

export const options = buildOptions('soak');

const testData = loadJsonData('qwen-prompts', '../../../../data/qwen-prompts.json');

export function setup() {
  console.log('='.repeat(60));
  console.log(`🕐 Soak Test: ${MODEL_NAME}`);
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`⏰ Started: ${new Date().toISOString()}`);
  console.log('='.repeat(60));
}

export default function () {
  // 10% models endpoint check
  if (Math.random() < 0.1) {
    get(`${BASE_URL}${ENDPOINTS.models}`, `${MODEL_NAME}-models`);
  } else {
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
  }

  sleep(2 + Math.random() * 1);  // Longer pause for LLM soak
}

export function teardown() {
  console.log('='.repeat(60));
  console.log(`✅ Soak test completed for ${MODEL_NAME}`);
  console.log('='.repeat(60));
}
