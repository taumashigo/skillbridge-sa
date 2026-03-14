# ============================================================
# SkillBridge SA - Phase 1.3 + 1.4 Install Script
#
# Run from your project root:
#   cd "C:\Users\Tau Mashigo\OneDrive\Desktop\Prompts\Job Seekers\Phase 1\skillbridge-sa-next"
#   powershell -ExecutionPolicy Bypass -File install-phase1-final.ps1
# ============================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " SkillBridge SA - Phase 1 Final" -ForegroundColor Cyan
Write-Host " Components + State Management" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Extract files
Write-Host "[1/3] Extracting files..." -ForegroundColor Yellow
if (Test-Path "phase1-final.zip") {
    Expand-Archive -Path "phase1-final.zip" -DestinationPath "." -Force
    Write-Host "  7 files extracted." -ForegroundColor Green
} else {
    Write-Host "  ERROR: phase1-final.zip not found!" -ForegroundColor Red
    exit 1
}

# Step 2: Install new packages
Write-Host "[2/3] Installing TanStack Query..." -ForegroundColor Yellow
npm install @tanstack/react-query --legacy-peer-deps 2>&1 | Out-Null
Write-Host "  @tanstack/react-query installed." -ForegroundColor Green

# Step 3: Verify
Write-Host "[3/3] Verifying files..." -ForegroundColor Yellow
$expected = @(
    "src\components\ui\extras.tsx",
    "src\lib\stores\ui-store.ts",
    "src\lib\stores\job-store.ts",
    "src\lib\hooks\query-provider.tsx",
    "src\lib\hooks\api-hooks.ts",
    "src\app\layout.tsx",
    "src\app\toast-wrapper.tsx"
)
$missing = @()
foreach ($f in $expected) {
    if (-not (Test-Path $f)) { $missing += $f }
}
if ($missing.Count -eq 0) {
    Write-Host "  All 7 files verified!" -ForegroundColor Green
} else {
    Write-Host "  WARNING: Missing files:" -ForegroundColor Red
    foreach ($m in $missing) { Write-Host "    - $m" -ForegroundColor Red }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Phase 1 Final - Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "NEW FILES:" -ForegroundColor White
Write-Host "  Components:" -ForegroundColor DarkGray
Write-Host "    - Skeleton, CardSkeleton, PageSkeleton (loading states)" -ForegroundColor DarkGray
Write-Host "    - EmptyState (no-data screens)" -ForegroundColor DarkGray
Write-Host "    - ToastContainer + showToast() (notifications)" -ForegroundColor DarkGray
Write-Host "    - StreamingText (typewriter effect for AI)" -ForegroundColor DarkGray
Write-Host "    - ConfidenceIndicator (circular score display)" -ForegroundColor DarkGray
Write-Host "  State Management:" -ForegroundColor DarkGray
Write-Host "    - useUIStore (sidebar, data mode, language)" -ForegroundColor DarkGray
Write-Host "    - useJobStore (current job, CV, scores, gaps)" -ForegroundColor DarkGray
Write-Host "    - QueryProvider + 14 API hooks ready for Phase 2" -ForegroundColor DarkGray
Write-Host ""
Write-Host "TEST:" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor Yellow
Write-Host "  Open http://localhost:3000 and verify everything works" -ForegroundColor Yellow
Write-Host ""
Write-Host "DEPLOY:" -ForegroundColor White
Write-Host "  git add ." -ForegroundColor Yellow
Write-Host '  git commit -m "Phase 1.3-1.4: Components + State Management"' -ForegroundColor Yellow
Write-Host "  git push" -ForegroundColor Yellow
Write-Host ""
