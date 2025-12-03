// =============================================================================
// Smoke Test: Fashion MNIST Classifier
// =============================================================================
//
// Quick health validation for the Fashion MNIST image classification model.
// Tests basic functionality without heavy load.
//
// Model Details
// -------------
// - Type      : Custom FastAPI model served via Ray Serve
// - Input     : 28x28 grayscale image (784 pixel values, 0-255)
// - Output    : Class prediction (0-9: T-shirt, Trouser, Pullover, etc.)
// - Endpoint  : /models/custom/fashion-mnist-classifier
//
// Test Scenarios
// --------------
// 1. fashion-health : Validates /health and /info endpoints
// 2. fashion-predict: Sends actual image data and validates prediction response
//
// Run Command
// -----------
// make smoke-fashion-mnist
//
// Expected Thresholds
// -------------------
// - Health: p(95) < 2000ms
// - Predict: p(95) < 5000ms
// - Error rate: < 10%
// =============================================================================

import http from 'k6/http';
import { group, sleep } from 'k6';
import { ENV, getCustomModelUrl } from '../../../../config/environments.js';
import { buildOptions } from '../../../../config/thresholds.js';
import { checkHealth, checkPrediction, checkJsonField } from '../../../../helpers/checks.js';
import { loadJsonData, randomSample } from '../../../../helpers/data.js';

const TEST_TYPE = 'smoke';
const TEST_TARGET = 'model-fashion-mnist';

const MODEL_URL = getCustomModelUrl('fashion-mnist');
const MNIST_DATA = loadJsonData('fashion-mnist-samples', '../../../../data/fashion-mnist.json');

export const options = buildOptions(TEST_TYPE, TEST_TARGET, {
  'fashion-health': {
    exec: 'testHealth',
  },
  'fashion-predict': {
    exec: 'testPredict',
  },
}, {
  'http_req_duration{scenario:fashion-health}': ['p(95)<2000'],
  'http_req_duration{scenario:fashion-predict}': ['p(95)<5000'],
});

export function testHealth() {
  group('fashion-health', () => {
    let res = http.get(`${MODEL_URL}/health`, { tags: { name: 'fashion-health' } });
    checkHealth(res, 'fashion-health');

    res = http.get(`${MODEL_URL}/info`, { tags: { name: 'fashion-info' } });
    checkJsonField(res, 'fashion-info', 'model_uri');
  });
  sleep(0.5);
}

export function testPredict() {
  group('fashion-predict', () => {
    const sample = randomSample(MNIST_DATA);
    const payload = { images: [sample] };  // API expects {"images": [[...pixels...]]}
    const res = http.post(`${MODEL_URL}/predict`, JSON.stringify(payload), {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'fashion-predict' },
    });
    checkPrediction(res, 'fashion-predict');
  });
  sleep(0.5);
}

export default function () {
  testHealth();
  testPredict();
}