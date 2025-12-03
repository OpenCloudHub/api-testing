// =============================================================================
// Smoke Test: Wine Quality Classifier
// =============================================================================
//
// Quick health validation for the Wine quality classification model.
// Tests basic functionality without heavy load.
//
// Model Details
// -------------
// - Type      : Custom FastAPI model served via Ray Serve
// - Input     : 13 chemical features (alcohol, malic acid, ash, etc.)
// - Output    : Wine class prediction (0, 1, or 2)
// - Endpoint  : /models/custom/wine-classifier
//
// Test Scenarios
// --------------
// 1. wine-health  : Validates /health and /info endpoints
// 2. wine-predict : Sends wine features and validates prediction response
//
// Run Command
// -----------
// make smoke-wine
//
// Expected Thresholds
// -------------------
// - Health: p(95) < 2000ms
// - Predict: p(95) < 3000ms
// - Error rate: < 10%
// =============================================================================

import http from 'k6/http';
import { group, sleep } from 'k6';
import { ENV, getCustomModelUrl } from '../../../../config/environments.js';
import { buildOptions } from '../../../../config/thresholds.js';
import { checkHealth, checkPrediction, checkJsonField } from '../../../../helpers/checks.js';
import { loadJsonData, randomSample } from '../../../../helpers/data.js';

const TEST_TYPE = 'smoke';
const TEST_TARGET = 'model-wine';

const MODEL_URL = getCustomModelUrl('wine');
const WINE_DATA = loadJsonData('wine-samples', '../../../../data/wine.json');

export const options = buildOptions(TEST_TYPE, TEST_TARGET, {
  'wine-health': {
    exec: 'testHealth',
  },
  'wine-predict': {
    exec: 'testPredict',
  },
}, {
  'http_req_duration{scenario:wine-health}': ['p(95)<2000'],
  'http_req_duration{scenario:wine-predict}': ['p(95)<3000'],
});

export function testHealth() {
  group('wine-health', () => {
    let res = http.get(`${MODEL_URL}/health`, { tags: { name: 'wine-health' } });
    checkHealth(res, 'wine-health');

    res = http.get(`${MODEL_URL}/info`, { tags: { name: 'wine-info' } });
    checkJsonField(res, 'wine-info', 'model_name');
  });
  sleep(0.5);
}

export function testPredict() {
  group('wine-predict', () => {
    const sample = randomSample(WINE_DATA);
    const res = http.post(`${MODEL_URL}/predict`, JSON.stringify(sample), {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'wine-predict' },
    });
    checkPrediction(res, 'wine-predict');
  });
  sleep(0.5);
}

export default function () {
  testHealth();
  testPredict();
}