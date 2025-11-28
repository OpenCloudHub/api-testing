// helpers/checks.js
// Standardized check functions with consistent naming

import { check } from 'k6';

/**
 * Standard health check with named checks for Grafana
 */
export function checkHealth(response, serviceName) {
  return check(response, {
    [`${serviceName}: responds`]: (r) => r.status > 0,
    [`${serviceName}: status OK`]: (r) => r.status >= 200 && r.status < 400,
    [`${serviceName}: latency < 2s`]: (r) => r.timings.duration < 2000,
  });
}

/**
 * Check response status
 */
export function checkStatus(response, serviceName, expectedStatus = 200) {
  return check(response, {
    [`${serviceName}: status ${expectedStatus}`]: (r) => r.status === expectedStatus,
  });
}

/**
 * Check response time
 */
export function checkLatency(response, serviceName, maxMs = 2000) {
  return check(response, {
    [`${serviceName}: latency < ${maxMs}ms`]: (r) => r.timings.duration < maxMs,
  });
}

/**
 * Check JSON field exists
 */
export function checkJsonField(response, serviceName, field) {
  return check(response, {
    [`${serviceName}: has ${field}`]: (r) => {
      try {
        const json = r.json();
        return field.split('.').reduce((o, k) => o?.[k], json) !== undefined;
      } catch {
        return false;
      }
    },
  });
}

/**
 * Check prediction response
 */
export function checkPrediction(response, serviceName) {
  return check(response, {
    [`${serviceName}: status 200`]: (r) => r.status === 200,
    [`${serviceName}: has prediction`]: (r) => {
      try {
        const json = r.json();
        return json.prediction !== undefined || json.predictions !== undefined;
      } catch {
        return false;
      }
    },
    [`${serviceName}: latency < 5s`]: (r) => r.timings.duration < 5000,
  });
}

/**
 * Check LLM completion response
 */
export function checkCompletion(response, serviceName) {
  return check(response, {
    [`${serviceName}: status 200`]: (r) => r.status === 200,
    [`${serviceName}: has choices`]: (r) => {
      try {
        return r.json().choices?.length > 0;
      } catch {
        return false;
      }
    },
  });
}