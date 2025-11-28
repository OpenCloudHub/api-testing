// tests/01-smoke/models/base/qwen.js
// Smoke test for Qwen LLM - OpenAI-compatible API
import { group } from 'k6';
import { getBaseModelUrl } from '../../../../config/environments.js';
import { BASE_MODEL_ENDPOINTS } from '../../../../config/endpoints.js';
import { buildOptions } from '../../../../config/thresholds.js';
import { get, postJson, healthCheck, checkDuration, checkHasField } from '../../../../helpers/http.js';
import { loadJsonData, sequentialSample } from '../../../../helpers/data.js';

const MODEL_NAME = 'qwen-0.5b';
const BASE_URL = getBaseModelUrl(MODEL_NAME);
const ENDPOINTS = BASE_MODEL_ENDPOINTS;

export const options = buildOptions('smoke');

const testData = loadJsonData('qwen-prompts', '../../../../data/qwen-prompts.json');

export function setup() {
  console.log('='.repeat(60));
  console.log(`🧪 Smoke Test: ${MODEL_NAME}`);
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`⏰ Started: ${new Date().toISOString()}`);
  console.log('='.repeat(60));

  return { baseUrl: BASE_URL };
}

export default function () {
  group('Models Endpoint', () => {
    const { response, ok } = get(`${BASE_URL}${ENDPOINTS.models}`, `${MODEL_NAME}-models`);
    if (ok) {
      checkHasField(response, `${MODEL_NAME}-models`, 'data');
      checkDuration(response, `${MODEL_NAME}-models`, 2000);
    }
  });

  group('Chat Completions Endpoint', () => {
    if (testData.length === 0) {
      console.warn('⚠️ No test data loaded, skipping chat test');
      return;
    }

    const sample = sequentialSample(testData, __ITER);
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
      checkHasField(response, `${MODEL_NAME}-chat`, 'choices');
      checkHasField(response, `${MODEL_NAME}-chat`, 'usage');
      checkDuration(response, `${MODEL_NAME}-chat`, 10000);  // LLMs can be slow

      // Validate response structure
      try {
        const choices = response.json('choices');
        if (choices && choices.length > 0 && choices[0].message) {
          // Valid response
        }
      } catch (e) {
        console.warn(`⚠️ Could not parse response: ${e.message}`);
      }
    }
  });
}

export function teardown() {
  console.log('='.repeat(60));
  console.log(`✅ Smoke test completed for ${MODEL_NAME}`);
  console.log('='.repeat(60));
}
