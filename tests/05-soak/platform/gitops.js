// tests/01-smoke/platform/gitops.js
import http from 'k6/http';
import { group, sleep } from 'k6';
import { ENV } from '../../../config/environments.js';
import { buildOptions } from '../../../config/thresholds.js';
import { checkHealth, checkStatus, checkJsonField } from '../../../helpers/checks.js';

const TEST_TYPE = 'soak';
const TEST_TARGET = 'platform-gitops';

const ARGOCD = ENV.platform.gitops.argocd;

export const options = buildOptions(TEST_TYPE, TEST_TARGET, {
  argocd: {
    exec: 'testArgoCD',
  },
}, {
  'http_req_duration{scenario:argocd}': ['p(95)<2000'],
});

export function testArgoCD() {
  group('argocd', () => {
    // Health
    let res = http.get(`${ARGOCD}/healthz`, { tags: { name: 'argocd-health' } });
    checkHealth(res, 'argocd-health');

    // Root
    res = http.get(`${ARGOCD}/`, { tags: { name: 'argocd-root' } });
    checkStatus(res, 'argocd-root', 200);

    // Version API
    res = http.get(`${ARGOCD}/api/version`, { tags: { name: 'argocd-version' } });
    checkStatus(res, 'argocd-version', 200);
    checkJsonField(res, 'argocd-version', 'Version');
  });
  sleep(0.5);
}

export default function () {
  testArgoCD();
}