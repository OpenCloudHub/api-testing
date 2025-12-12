// Spike Test: Infrastructure Services
import http from 'k6/http';
import { group, sleep } from 'k6';
import { ENV } from '../../../config/environments.js';
import { buildOptions } from '../../../config/thresholds.js';
import { checkHealth, checkStatus } from '../../../helpers/checks.js';

const TEST_TYPE = 'spike';
const TEST_TARGET = 'platform-infra';

const MINIO_CONSOLE = ENV.platform.infrastructure['minio-console'];
const MINIO_API = ENV.platform.infrastructure['minio-api'];
const PGADMIN = ENV.platform.infrastructure.pgadmin;

export const options = buildOptions(TEST_TYPE, TEST_TARGET, {
  minio: {
    exec: 'testMinio',
  },
  pgadmin: {
    exec: 'testPgAdmin',
  },
}, {
  'http_req_duration{scenario:minio}': ['p(95)<2000'],
  'http_req_duration{scenario:pgadmin}': ['p(95)<3000'],
});

export function testMinio() {
  group('minio', () => {
    // Console root
    let res = http.get(`${MINIO_CONSOLE}/`, { tags: { name: 'minio-console-root' } });
    checkStatus(res, 'minio-console-root', 200);

    // API health
    res = http.get(`${MINIO_API}/minio/health/live`, { tags: { name: 'minio-api-health' } });
    checkHealth(res, 'minio-api-health');
  });
  sleep(0.5);
}

export function testPgAdmin() {
  group('pgadmin', () => {
    let res = http.get(`${PGADMIN}/`, { tags: { name: 'pgadmin-root' } });
    // pgAdmin redirects to login
    checkStatus(res, 'pgadmin-root', 200) || checkStatus(res, 'pgadmin-root', 302);
  });
  sleep(0.5);
}

export default function () {
  testMinio();
  testPgAdmin();
}