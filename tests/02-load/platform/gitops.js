// tests/02-load/platform/gitops.js
import { group, sleep } from 'k6';
import { ENV } from '../../../config/environments.js';
import { PLATFORM_ENDPOINTS } from '../../../config/endpoints.js';
import { buildOptions } from '../../../config/thresholds.js';
import { get, healthCheck, checkDuration } from '../../../helpers/http.js';

export const options = buildOptions('load');

export function setup() {
  console.log('='.repeat(60));
  console.log('📊 Load Test: GitOps Services');
  console.log(`⏰ Started: ${new Date().toISOString()}`);
  console.log('='.repeat(60));
}

export default function () {
  group('ArgoCD', () => {
    const baseUrl = ENV.platform.gitops.argocd;
    const endpoints = PLATFORM_ENDPOINTS.argocd;

    // Mix of endpoints
    const rand = Math.random();
    if (rand < 0.4) {
      const { response, healthy } = healthCheck(`${baseUrl}${endpoints.root}`, 'argocd-root');
      if (healthy) checkDuration(response, 'argocd-root', 2000);
    } else if (rand < 0.7) {
      const { response, ok } = get(`${baseUrl}${endpoints.health}`, 'argocd-health');
      if (ok) checkDuration(response, 'argocd-health', 2000);
    } else {
      const { response, ok } = get(`${baseUrl}${endpoints.api}`, 'argocd-version');
      if (ok) checkDuration(response, 'argocd-version', 2000);
    }
  });

  sleep(0.2 + Math.random() * 0.3);
}

export function teardown() {
  console.log('='.repeat(60));
  console.log('✅ GitOps load test completed');
  console.log('='.repeat(60));
}
