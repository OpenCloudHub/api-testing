#!/bin/bash
# Aggregate k6 test results into a summary table

RESULTS_DIR="${1:-.}"

if [ ! -d "$RESULTS_DIR" ]; then
  echo "Usage: $0 <results-directory>"
  exit 1
fi

echo "════════════════════════════════════════════════════════════════════════════"
echo "📊 K6 Test Results Summary"
echo "📁 Directory: $RESULTS_DIR"
echo "════════════════════════════════════════════════════════════════════════════"
echo ""
printf "%-35s %8s %10s %10s %10s %8s\n" "TEST" "STATUS" "REQUESTS" "FAILED" "P95(ms)" "CHECKS"
echo "────────────────────────────────────────────────────────────────────────────"

# Process each summary file
for summary in "$RESULTS_DIR"/*-summary.json; do
  [ -f "$summary" ] || continue
  
  test_name=$(basename "$summary" -summary.json)
  
  if command -v jq &> /dev/null; then
    requests=$(jq -r '.metrics.http_reqs.count // 0' "$summary" 2>/dev/null)
    failed=$(jq -r '.metrics.http_req_failed.passes // 0' "$summary" 2>/dev/null)
    p95=$(jq -r '.metrics.http_req_duration["p(95)"] // 0' "$summary" 2>/dev/null | xargs printf "%.0f")
    checks_value=$(jq -r '.metrics.checks.value // 0' "$summary" 2>/dev/null)
    checks_pct=$(echo "$checks_value * 100" | bc 2>/dev/null | xargs printf "%.1f" 2>/dev/null || echo "N/A")
    
    # Determine status
    if [ "$checks_pct" = "N/A" ]; then
      status="⚠️ N/A"
    elif (( $(echo "$checks_pct >= 90" | bc -l 2>/dev/null || echo 0) )); then
      status="✅ PASS"
    elif (( $(echo "$checks_pct >= 70" | bc -l 2>/dev/null || echo 0) )); then
      status="⚠️ WARN"
    else
      status="❌ FAIL"
    fi
    
    printf "%-35s %8s %10s %10s %10s %7s%%\n" "$test_name" "$status" "$requests" "$failed" "$p95" "$checks_pct"
  else
    echo "$test_name: (install jq for detailed summary)"
  fi
done

echo "════════════════════════════════════════════════════════════════════════════"
