// tests/01-smoke/platform/gitops.js
import { group } from 'k6';
import { ENV } from '../../../config/environments.js';
import { PLATFORM_ENDPOINTS } from '../../../config/endpoints.js';
import { buildOptions } from '../../../config/thresholds.js';
import { get, healthCheck, checkDuration } from '../../../helpers/http.js';

export const options = buildOptions('smoke');

export function setup() {
  console.log('='.repeat(60));
  console.log('🧪 Smoke Test: GitOps Services');
  console.log(`⏰ Started: ${new Date().toISOString()}`);
  console.log('='.repeat(60));
}

export default function () {
  group('ArgoCD', () => {
    const baseUrl = ENV.platform.gitops.argocd;
    const endpoints = PLATFORM_ENDPOINTS.argocd;

    const { response, healthy } = healthCheck(`${baseUrl}${endpoints.root}`, 'argocd-root');
    if (healthy) {
      checkDuration(response, 'argocd-root', 2000);
    }

    // Health endpoint
    const healthRes = get(`${baseUrl}${endpoints.health}`, 'argocd-health');
    if (healthRes.ok) {
      checkDuration(healthRes.response, 'argocd-health', 2000);
    }

    // API version (doesn't require auth)
    const versionRes = get(`${baseUrl}${endpoints.api}`, 'argocd-version');
    if (versionRes.ok) {
      checkDuration(versionRes.response, 'argocd-version', 2000);
    }
  });
}

export function teardown() {
  console.log('='.repeat(60));
  console.log('✅ GitOps smoke test completed');
  console.log('='.repeat(60));
}
