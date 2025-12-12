// =============================================================================
// Soak Test: Wine Quality Classifier
// =============================================================================
//
// Extended duration test for the Wine quality classification model.
// Finds memory leaks, connection exhaustion, and stability issues.
//
// Load Profile
// ------------
// - Duration : ~34 minutes
// - VUs      : Constant 5 VUs
//
// Run Command
// -----------
// make soak-wine
// =============================================================================

import http from 'k6/http';
import { group, sleep } from 'k6';
import { ENV, getCustomModelUrl } from '../../../../config/environments.js';
import { buildOptions } from '../../../../config/thresholds.js';
import { checkHealth, checkPrediction, checkJsonField } from '../../../../helpers/checks.js';
import { loadJsonData, randomSample } from '../../../../helpers/data.js';

const TEST_TYPE = 'soak';
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