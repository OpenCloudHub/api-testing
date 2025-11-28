// tests/05-soak/platform/gitops.js
import { group, sleep } from 'k6';
import { ENV } from '../../../config/environments.js';
import { PLATFORM_ENDPOINTS } from '../../../config/endpoints.js';
import { buildOptions } from '../../../config/thresholds.js';
import { get, checkDuration } from '../../../helpers/http.js';

export const options = buildOptions('soak');

export function setup() {
  console.log('='.repeat(60));
  console.log('🕐 Soak Test: GitOps Services');
  console.log(`⏰ Started: ${new Date().toISOString()}`);
  console.log('='.repeat(60));
}

export default function () {
  group('ArgoCD', () => {
    const baseUrl = ENV.platform.gitops.argocd;
    const endpoints = PLATFORM_ENDPOINTS.argocd;

    const { response, ok } = get(`${baseUrl}${endpoints.health}`, 'argocd-health');
    if (ok) checkDuration(response, 'argocd-health', 2000);
  });

  sleep(1 + Math.random() * 0.5);
}

export function teardown() {
  console.log('='.repeat(60));
  console.log('✅ GitOps soak test completed');
  console.log('='.repeat(60));
}
