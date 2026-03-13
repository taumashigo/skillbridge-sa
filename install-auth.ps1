# ============================================================
# SkillBridge SA - Phase 1.2 Auth Install Script
#
# Run from your project root:
#   cd "C:\Users\Tau Mashigo\OneDrive\Desktop\Prompts\Job Seekers\Phase 1\skillbridge-sa-next"
#   powershell -ExecutionPolicy Bypass -File install-auth.ps1
# ============================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " SkillBridge SA - Auth Install" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Extract auth files
Write-Host "[1/3] Extracting auth files..." -ForegroundColor Yellow
if (Test-Path "auth-files.zip") {
    Expand-Archive -Path "auth-files.zip" -DestinationPath "." -Force
    Write-Host "  7 files extracted." -ForegroundColor Green
} else {
    Write-Host "  ERROR: auth-files.zip not found!" -ForegroundColor Red
    Write-Host "  Make sure auth-files.zip is in your project folder." -ForegroundColor Red
    exit 1
}

# Step 2: Install new dependency
Write-Host "[2/3] Installing Resend package..." -ForegroundColor Yellow
npm install resend --legacy-peer-deps 2>&1 | Out-Null
Write-Host "  resend installed." -ForegroundColor Green

# Step 3: Verify
Write-Host "[3/3] Verifying files..." -ForegroundColor Yellow
$expected = @(
    "src\lib\auth\options.ts",
    "src\lib\auth\provider.tsx",
    "src\app\api\auth\[...nextauth]\route.ts",
    "src\app\(auth)\login\page.tsx",
    "src\app\(app)\layout.tsx",
    "src\app\layout.tsx",
    "src\middleware.ts"
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
Write-Host " Auth Installation Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "WHAT CHANGED:" -ForegroundColor White
Write-Host "  - Real magic link auth via Resend email" -ForegroundColor DarkGray
Write-Host "  - Protected routes (dashboard etc. require login)" -ForegroundColor DarkGray
Write-Host "  - Session display + sign out in sidebar" -ForegroundColor DarkGray
Write-Host "  - JWT sessions lasting 30 days" -ForegroundColor DarkGray
Write-Host ""
Write-Host "TEST IT:" -ForegroundColor White
Write-Host "  1. Run: npm run dev" -ForegroundColor Yellow
Write-Host "  2. Open: http://localhost:3000" -ForegroundColor Yellow
Write-Host "  3. Click Get Started -> enter your real email" -ForegroundColor Yellow
Write-Host "  4. Check your inbox for the magic link email" -ForegroundColor Yellow
Write-Host "  5. Click the link -> you should land on /dashboard" -ForegroundColor Yellow
Write-Host ""
Write-Host "DEPLOY:" -ForegroundColor White
Write-Host "  git add ." -ForegroundColor Yellow
Write-Host '  git commit -m "Phase 1.2: Real auth with NextAuth + Resend magic links"' -ForegroundColor Yellow
Write-Host "  git push" -ForegroundColor Yellow
Write-Host ""
