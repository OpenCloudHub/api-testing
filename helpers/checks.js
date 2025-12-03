// =============================================================================
// Check Functions Library
// =============================================================================
//
// Standardized k6 check functions with consistent naming conventions.
// These functions wrap k6's check() to provide reusable, named assertions
// that appear clearly in test results and Grafana dashboards.
//
// Why Named Checks?
// -----------------
// - Consistent naming across all tests (e.g., 'fashion-health: status OK')
// - Easy filtering in Grafana by service or check type
// - Clear failure identification in test reports
// - Reusable patterns reduce code duplication
//
// Available Checks
// ----------------
// - checkHealth()     : Standard health endpoint validation
// - checkStatus()     : Specific HTTP status code assertion
// - checkLatency()    : Response time threshold validation
// - checkJsonField()  : JSON response field existence
// - checkPrediction() : ML model prediction response validation
// - checkCompletion() : LLM completion response validation
//
// Usage
// -----
// import { checkHealth, checkPrediction } from '../helpers/checks.js';
// const res = http.get(`${url}/health`);
// checkHealth(res, 'my-service');
//
// See Also
// --------
// - helpers/http.js : HTTP request utilities with built-in checks
// - k6 checks docs  : https://k6.io/docs/using-k6/checks/
// =============================================================================

import { check } from 'k6';

// -----------------------------------------------------------------------------
// Health Check
// -----------------------------------------------------------------------------
/**
 * Standard health check with named checks for Grafana.
 * Validates that the service responds, returns a success status, and is fast.
 *
 * @param {object} response - k6 HTTP response object
 * @param {string} serviceName - Name for check labels (e.g., 'mlflow-health')
 * @returns {boolean} True if all checks pass
 */
export function checkHealth(response, serviceName) {
  return check(response, {
    [`${serviceName}: responds`]: (r) => r.status > 0,
    [`${serviceName}: status OK`]: (r) => r.status >= 200 && r.status < 400,
    [`${serviceName}: latency < 2s`]: (r) => r.timings.duration < 2000,
  });
}

// -----------------------------------------------------------------------------
// Status Check
// -----------------------------------------------------------------------------
/**
 * Check response status matches expected value.
 *
 * @param {object} response - k6 HTTP response object
 * @param {string} serviceName - Name for check labels
 * @param {number} expectedStatus - Expected HTTP status code (default: 200)
 * @returns {boolean} True if status matches
 */
export function checkStatus(response, serviceName, expectedStatus = 200) {
  return check(response, {
    [`${serviceName}: status ${expectedStatus}`]: (r) => r.status === expectedStatus,
  });
}

// -----------------------------------------------------------------------------
// Latency Check
// -----------------------------------------------------------------------------
/**
 * Check response time against threshold.
 *
 * @param {object} response - k6 HTTP response object
 * @param {string} serviceName - Name for check labels
 * @param {number} maxMs - Maximum acceptable latency in milliseconds
 * @returns {boolean} True if latency is under threshold
 */
export function checkLatency(response, serviceName, maxMs = 2000) {
  return check(response, {
    [`${serviceName}: latency < ${maxMs}ms`]: (r) => r.timings.duration < maxMs,
  });
}

// -----------------------------------------------------------------------------
// JSON Field Check
// -----------------------------------------------------------------------------
/**
 * Check JSON response contains expected field.
 * Supports nested fields using dot notation (e.g., 'data.items').
 *
 * @param {object} response - k6 HTTP response object
 * @param {string} serviceName - Name for check labels
 * @param {string} field - Field path to check (dot notation for nested)
 * @returns {boolean} True if field exists
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

// -----------------------------------------------------------------------------
// ML Prediction Check
// -----------------------------------------------------------------------------
/**
 * Check ML model prediction response.
 * Validates status, response format, and latency for prediction endpoints.
 *
 * @param {object} response - k6 HTTP response object
 * @param {string} serviceName - Name for check labels
 * @returns {boolean} True if all prediction checks pass
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

// -----------------------------------------------------------------------------
// LLM Completion Check
// -----------------------------------------------------------------------------
/**
 * Check LLM completion response.
 * Validates OpenAI-compatible response format with choices array.
 *
 * @param {object} response - k6 HTTP response object
 * @param {string} serviceName - Name for check labels
 * @returns {boolean} True if completion response is valid
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