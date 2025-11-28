// tests/06-breakpoint/models/base/qwen.js
import { getBaseModelUrl } from '../../../../config/environments.js';
import { BASE_MODEL_ENDPOINTS } from '../../../../config/endpoints.js';
import { buildOptions } from '../../../../config/thresholds.js';
import { postJson } from '../../../../helpers/http.js';
import { loadJsonData, randomSample } from '../../../../helpers/data.js';

const MODEL_NAME = 'qwen-0.5b';
const BASE_URL = getBaseModelUrl(MODEL_NAME);
const ENDPOINTS = BASE_MODEL_ENDPOINTS;

export const options = buildOptions('breakpoint');

const testData = loadJsonData('qwen-prompts', '../../../../data/qwen-prompts.json');

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
  const payload = {
    model: MODEL_NAME,
    messages: sample.messages,
    max_tokens: 10,  // Minimal tokens for max throughput
    temperature: 0.7,
  };

  postJson(`${BASE_URL}${ENDPOINTS.chat}`, payload, `${MODEL_NAME}-chat`);
}

export function teardown() {
  console.log('='.repeat(60));
  console.log(`✅ Breakpoint test completed for ${MODEL_NAME}`);
  console.log('='.repeat(60));
}
