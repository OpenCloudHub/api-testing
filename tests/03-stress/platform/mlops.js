// Stress Test: MLOps Platform Services
import http from 'k6/http';
import { group, sleep } from 'k6';
import { ENV } from '../../../config/environments.js';
import { buildOptions } from '../../../config/thresholds.js';
import { checkHealth, checkStatus, checkJsonField } from '../../../helpers/checks.js';

const TEST_TYPE = 'stress';
const TEST_TARGET = 'platform-mlops';

const MLFLOW = ENV.platform.mlops.mlflow;
const ARGO = ENV.platform.mlops['argo-workflows'];

export const options = buildOptions(TEST_TYPE, TEST_TARGET, {
  mlflow: {
    exec: 'testMlflow',
  },
  'argo-workflows': {
    exec: 'testArgoWorkflows',
  },
}, {
  'http_req_duration{scenario:mlflow}': ['p(95)<2000'],
  'http_req_duration{scenario:argo-workflows}': ['p(95)<2000'],
});

export function testMlflow() {
  group('mlflow', () => {
    // Health check
    let res = http.get(`${MLFLOW}/health`, { tags: { name: 'mlflow-health' } });
    checkHealth(res, 'mlflow-health');

    // Root
    res = http.get(`${MLFLOW}/`, { tags: { name: 'mlflow-root' } });
    checkStatus(res, 'mlflow-root', 200);

    // API - experiments
    res = http.get(`${MLFLOW}/api/2.0/mlflow/experiments/search?max_results=1`, {
      tags: { name: 'mlflow-experiments' }
    });
    checkStatus(res, 'mlflow-experiments', 200);
    checkJsonField(res, 'mlflow-experiments', 'experiments');
  });
  sleep(0.5);
}

export function testArgoWorkflows() {
  group('argo-workflows', () => {
    // Health
    let res = http.get(`${ARGO}/api/v1/info`, { tags: { name: 'argo-info' } });
    checkHealth(res, 'argo-info');

    // Root
    res = http.get(`${ARGO}/`, { tags: { name: 'argo-root' } });
    checkStatus(res, 'argo-root', 200);
  });
  sleep(0.5);
}

export default function () {
  testMlflow();
  testArgoWorkflows();
}