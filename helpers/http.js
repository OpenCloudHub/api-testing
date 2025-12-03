// =============================================================================
// HTTP Request Utilities
// =============================================================================
//
// Simple HTTP utilities for k6 tests with built-in checks and tagging.
// Wraps k6/http module with sensible defaults and automatic validation.
//
// Features
// --------
// - Automatic TLS skip for local development
// - Built-in response status checks
// - Request tagging for Grafana filtering
// - Configurable timeouts
//
// Functions
// ---------
// - get()           : GET request with status check
// - postJson()      : POST JSON with status check
// - healthCheck()   : GET with relaxed success criteria
// - checkDuration() : Validate response time
// - checkHasField() : Validate JSON field exists
//
// Usage
// -----
// import { get, postJson, healthCheck } from '../helpers/http.js';
//
// // Simple GET with automatic check
// const { response, ok } = get(`${baseUrl}/health`, 'service-health');
//
// // POST JSON data
// const { response, ok } = postJson(url, { query: 'hello' }, 'my-request');
//
// See Also
// --------
// - helpers/checks.js : Additional check functions
// - k6 http docs     : https://k6.io/docs/javascript-api/k6-http/
// =============================================================================

import http from 'k6/http';
import { check } from 'k6';
import { ENV } from '../config/environments.js';

// Default request parameters applied to all requests
const defaultParams = {
  timeout: '10s',
  insecureSkipTLSVerify: ENV.insecureSkipTLSVerify,
};

// -----------------------------------------------------------------------------
// GET Request
// -----------------------------------------------------------------------------
/**
 * GET request with basic response check.
 *
 * @param {string} url - Request URL
 * @param {string} name - Request name for tagging and check labels
 * @param {object} params - Additional k6 request params (optional)
 * @returns {object} { response, ok } - Response object and check result
 *
 * @example
 * const { response, ok } = get(`${baseUrl}/info`, 'model-info');
 */
export function get(url, name, params = {}) {
  const res = http.get(url, {
    ...defaultParams,
    ...params,
    tags: { name, ...params.tags },
  });

  const ok = check(res, {
    [`${name} status OK`]: (r) => r.status >= 200 && r.status < 400,
  });

  return { response: res, ok };
}

// -----------------------------------------------------------------------------
// POST JSON Request
// -----------------------------------------------------------------------------
/**
 * POST JSON request with automatic content-type and check.
 *
 * @param {string} url - Request URL
 * @param {object} body - Request body (will be JSON stringified)
 * @param {string} name - Request name for tagging and check labels
 * @param {object} params - Additional k6 request params (optional)
 * @returns {object} { response, ok } - Response object and check result
 *
 * @example
 * const { response, ok } = postJson(url, { features: [1,2,3] }, 'predict');
 */
export function postJson(url, body, name, params = {}) {
  const res = http.post(url, JSON.stringify(body), {
    ...defaultParams,
    ...params,
    headers: {
      'Content-Type': 'application/json',
      ...params.headers,
    },
    tags: { name, ...params.tags },
  });

  const ok = check(res, {
    [`${name} status OK`]: (r) => r.status >= 200 && r.status < 400,
  });

  return { response: res, ok };
}

// -----------------------------------------------------------------------------
// Health Check Request
// -----------------------------------------------------------------------------
/**
 * Health check - GET with relaxed success criteria.
 * Returns both 'responds' (any response) and 'healthy' (2xx/3xx status).
 *
 * @param {string} url - Health endpoint URL
 * @param {string} name - Request name for tagging and check labels
 * @returns {object} { response, ok, healthy } - Response and check results
 *
 * @example
 * const { response, healthy } = healthCheck(`${baseUrl}/health`, 'api-health');
 */
export function healthCheck(url, name) {
  const res = http.get(url, {
    ...defaultParams,
    tags: { name, type: 'health' },
  });

  const responds = check(res, {
    [`${name} responds`]: (r) => r.status > 0,
  });

  const healthy = check(res, {
    [`${name} healthy`]: (r) => r.status >= 200 && r.status < 400,
  });

  return { response: res, ok: responds, healthy };
}

// -----------------------------------------------------------------------------
// Duration Check
// -----------------------------------------------------------------------------
/**
 * Check response time against threshold.
 *
 * @param {object} response - k6 HTTP response object
 * @param {string} name - Check label name
 * @param {number} maxMs - Maximum acceptable duration in milliseconds
 * @returns {boolean} True if duration is under threshold
 */
export function checkDuration(response, name, maxMs) {
  return check(response, {
    [`${name} duration < ${maxMs}ms`]: (r) => r.timings.duration < maxMs,
  });
}

// -----------------------------------------------------------------------------
// JSON Field Check
// -----------------------------------------------------------------------------
/**
 * Check JSON response has expected field.
 *
 * @param {object} response - k6 HTTP response object
 * @param {string} name - Check label name
 * @param {string} field - JSON field name to check
 * @returns {boolean} True if field exists
 */
export function checkHasField(response, name, field) {
  return check(response, {
    [`${name} has ${field}`]: (r) => {
      try {
        return r.json(field) !== undefined;
      } catch {
        return false;
      }
    },
  });
}