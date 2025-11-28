// tests/01-smoke/platform/observability.js
import http from 'k6/http';
import { group, sleep } from 'k6';
import { ENV } from '../../../config/environments.js';
import { buildOptions } from '../../../config/thresholds.js';
import { checkHealth, checkStatus, checkJsonField } from '../../../helpers/checks.js';

const TEST_TYPE = 'smoke';
const TEST_TARGET = 'platform-obs';

const GRAFANA = ENV.platform.observability.grafana;

export const options = buildOptions(TEST_TYPE, TEST_TARGET, {
  grafana: {
    exec: 'testGrafana',
  },
}, {
  'http_req_duration{scenario:grafana}': ['p(95)<2000'],
});

export function testGrafana() {
  group('grafana', () => {
    // Health API
    let res = http.get(`${GRAFANA}/api/health`, { tags: { name: 'grafana-health' } });
    checkHealth(res, 'grafana-health');
    checkJsonField(res, 'grafana-health', 'database');

    // Root
    res = http.get(`${GRAFANA}/`, { tags: { name: 'grafana-root' } });
    checkStatus(res, 'grafana-root', 200);
  });
  sleep(0.5);
}

export default function () {
  testGrafana();
}