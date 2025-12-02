// tests/01-smoke/models/custom/fashion-mnist.js
import http from 'k6/http';
import { group, sleep } from 'k6';
import { ENV, getCustomModelUrl } from '../../../../config/environments.js';
import { buildOptions } from '../../../../config/thresholds.js';
import { checkHealth, checkPrediction, checkJsonField } from '../../../../helpers/checks.js';
import { loadJsonData, randomSample } from '../../../../helpers/data.js';

const TEST_TYPE = 'spike';
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
    checkJsonField(res, 'fashion-info', 'model_name');
  });
  sleep(0.5);
}

export function testPredict() {
  group('fashion-predict', () => {
    const sample = randomSample(MNIST_DATA);
    const res = http.post(`${MODEL_URL}/predict`, JSON.stringify(sample), {
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