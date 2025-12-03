// =============================================================================
// Smoke Test: Infrastructure Platform Services
// =============================================================================
//
// Quick health validation for infrastructure services:
// MinIO (object storage) and pgAdmin (database administration).
//
// Services Tested
// ---------------
// 1. MinIO Console
//    - Purpose: Object storage web interface
//    - Endpoints: /
//
// 2. MinIO API
//    - Purpose: S3-compatible object storage API
//    - Endpoints: /minio/health/live
//
// 3. pgAdmin
//    - Purpose: PostgreSQL database administration
//    - Endpoints: / (may redirect to login)
//
// Run Command
// -----------
// make smoke-infra
//
// Expected Thresholds
// -------------------
// - MinIO: p(95) < 2000ms
// - pgAdmin: p(95) < 3000ms
// - Error rate: < 10%
// =============================================================================

import http from 'k6/http';
import { group, sleep } from 'k6';
import { ENV } from '../../../config/environments.js';
import { buildOptions } from '../../../config/thresholds.js';
import { checkHealth, checkStatus } from '../../../helpers/checks.js';

const TEST_TYPE = 'smoke';
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