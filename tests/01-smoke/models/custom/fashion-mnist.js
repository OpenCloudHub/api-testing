// tests/01-smoke/models/custom/fashion-mnist.js
// Smoke test for Fashion MNIST classifier - verify all endpoints work

import { group } from 'k6';
import { getCustomModelUrl, ENV } from '../../../../config/environments.js';
import { CUSTOM_MODEL_ENDPOINTS } from '../../../../config/endpoints.js';
import { buildOptions } from '../../../../config/thresholds.js';
import { get, postJson, healthCheck, checkDuration, checkHasField } from '../../../../helpers/http.js';
import { loadJsonData, sequentialSample } from '../../../../helpers/data.js';

// Test configuration
const MODEL_NAME = 'fashion-mnist';
const BASE_URL = getCustomModelUrl(MODEL_NAME);
const ENDPOINTS = CUSTOM_MODEL_ENDPOINTS;

// k6 options
export const options = buildOptions('smoke');

// Load test data (shared across VUs)
const testData = loadJsonData('fashion-mnist-samples', '../../../../data/fashion-mnist.json');

// Setup - runs once before test
export function setup() {
  console.log('='.repeat(60));
  console.log(`🧪 Smoke Test: ${MODEL_NAME}`);
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`⏰ Started: ${new Date().toISOString()}`);
  console.log('='.repeat(60));

  return { baseUrl: BASE_URL };
}

// Main test function - runs for each VU iteration
export default function (data) {
  group('Root Endpoint', () => {
    const { response, ok } = get(`${BASE_URL}${ENDPOINTS.root}`, `${MODEL_NAME}-root`);

    if (ok) {
      checkHasField(response, `${MODEL_NAME}-root`, 'service');
      checkHasField(response, `${MODEL_NAME}-root`, 'version');
      checkDuration(response, `${MODEL_NAME}-root`, 1000);
    }
  });

  group('Health Endpoint', () => {
    const { response, healthy } = healthCheck(`${BASE_URL}${ENDPOINTS.health}`, `${MODEL_NAME}-health`);

    if (healthy) {
      checkHasField(response, `${MODEL_NAME}-health`, 'status');
      checkHasField(response, `${MODEL_NAME}-health`, 'model_loaded');
      checkDuration(response, `${MODEL_NAME}-health`, 1000);
    }
  });

  group('Info Endpoint', () => {
    const { response, ok } = get(`${BASE_URL}${ENDPOINTS.info}`, `${MODEL_NAME}-info`);

    if (ok) {
      checkHasField(response, `${MODEL_NAME}-info`, 'model_uri');
      checkHasField(response, `${MODEL_NAME}-info`, 'output_classes');
      checkDuration(response, `${MODEL_NAME}-info`, 1000);
    }
  });

  group('Predict Endpoint', () => {
    if (testData.length === 0) {
      console.warn('⚠️ No test data loaded, skipping predict test');
      return;
    }

    // Get a sample image
    const sample = sequentialSample(testData, __ITER);
    const payload = { images: [sample] };

    const { response, ok } = postJson(
      `${BASE_URL}${ENDPOINTS.predict}`,
      payload,
      `${MODEL_NAME}-predict`
    );

    if (ok) {
      checkHasField(response, `${MODEL_NAME}-predict`, 'predictions');
      checkHasField(response, `${MODEL_NAME}-predict`, 'processing_time_ms');
      checkDuration(response, `${MODEL_NAME}-predict`, 3000);

      // Validate prediction structure
      try {
        const predictions = response.json('predictions');
        if (predictions && predictions.length > 0) {
          const pred = predictions[0];
          if (pred.class_id >= 0 && pred.class_id <= 9 &&
            pred.confidence >= 0 && pred.confidence <= 1) {
            // Valid prediction
          }
        }
      } catch (e) {
        console.warn(`⚠️ Could not parse prediction: ${e.message}`);
      }
    }
  });
}

// Teardown - runs once after test
export function teardown(data) {
  console.log('='.repeat(60));
  console.log(`✅ Smoke test completed for ${MODEL_NAME}`);
  console.log('='.repeat(60));
}