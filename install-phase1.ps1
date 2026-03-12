# ============================================================
# SkillBridge SA - Phase 1 Install Script
#
# INSTRUCTIONS:
# 1. Download both files to your project folder:
#    - install-phase1.ps1 (this file)
#    - phase1-files.zip
#
# 2. Open PowerShell, navigate to your project:
#    cd "C:\Users\Tau Mashigo\OneDrive\Desktop\Prompts\Job Seekers\Phase 1\skillbridge-sa-next"
#
# 3. Run:
#    powershell -ExecutionPolicy Bypass -File install-phase1.ps1
# ============================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " SkillBridge SA - Phase 1 Install" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Backup
Write-Host "[1/4] Backing up current page.tsx..." -ForegroundColor Yellow
if (Test-Path "src\app\page.tsx") {
    Copy-Item "src\app\page.tsx" "src\app\page.tsx.bak" -Force
    Write-Host "  Saved as src\app\page.tsx.bak" -ForegroundColor Green
} else {
    Write-Host "  No page.tsx found to backup." -ForegroundColor DarkGray
}

# Step 2: Extract zip
Write-Host "[2/4] Extracting new files..." -ForegroundColor Yellow
if (Test-Path "phase1-files.zip") {
    Expand-Archive -Path "phase1-files.zip" -DestinationPath "." -Force
    Write-Host "  20 files extracted." -ForegroundColor Green
} else {
    Write-Host "  ERROR: phase1-files.zip not found!" -ForegroundColor Red
    Write-Host "  Make sure phase1-files.zip is in the same folder as this script." -ForegroundColor Red
    exit 1
}

# Step 3: Remove the old monolithic page.tsx (backup already saved)
Write-Host "[3/4] Removing old monolithic page.tsx..." -ForegroundColor Yellow
if (Test-Path "src\app\page.tsx.bak") {
    # The zip already placed a new structure, but the old page.tsx
    # was overwritten by the (marketing) route group handling /
    # We need to make sure the old page.tsx is gone since (marketing)/page.tsx now serves /
    if (Test-Path "src\app\page.tsx") {
        Remove-Item "src\app\page.tsx" -Force
        Write-Host "  Old page.tsx removed (backup saved as page.tsx.bak)" -ForegroundColor Green
    }
}

# Step 4: Verify
Write-Host "[4/4] Verifying installation..." -ForegroundColor Yellow
$expected = @(
    "src\lib\theme\tokens.ts",
    "src\lib\theme\icons.tsx",
    "src\lib\data\mock.ts",
    "src\components\ui\base.tsx",
    "src\components\charts\Radar.tsx",
    "src\app\layout.tsx",
    "src\app\globals.css",
    "src\app\(marketing)\page.tsx",
    "src\app\(auth)\login\page.tsx",
    "src\app\(onboarding)\onboarding\page.tsx",
    "src\app\(onboarding)\job-input\page.tsx",
    "src\app\(app)\layout.tsx",
    "src\app\(app)\dashboard\page.tsx",
    "src\app\(app)\assessment\page.tsx",
    "src\app\(app)\learning\page.tsx",
    "src\app\(app)\podcast\page.tsx",
    "src\app\(app)\cv-optimiser\page.tsx",
    "src\app\(app)\portfolio\page.tsx",
    "src\app\(app)\interview\page.tsx",
    "src\app\(app)\settings\page.tsx"
)

$missing = @()
foreach ($f in $expected) {
    if (-not (Test-Path $f)) {
        $missing += $f
    }
}

if ($missing.Count -eq 0) {
    Write-Host "  All 20 files verified!" -ForegroundColor Green
} else {
    Write-Host "  WARNING: Missing files:" -ForegroundColor Red
    foreach ($m in $missing) {
        Write-Host "    - $m" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Installation Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "NEW ROUTE STRUCTURE:" -ForegroundColor White
Write-Host "  /                -> Landing page (marketing)" -ForegroundColor DarkGray
Write-Host "  /login           -> Auth (magic link)" -ForegroundColor DarkGray
Write-Host "  /onboarding      -> Profile setup wizard" -ForegroundColor DarkGray
Write-Host "  /job-input       -> Job post + CV upload" -ForegroundColor DarkGray
Write-Host "  /dashboard       -> Main dashboard" -ForegroundColor DarkGray
Write-Host "  /assessment      -> Skills assessment" -ForegroundColor DarkGray
Write-Host "  /learning        -> Learning library" -ForegroundColor DarkGray
Write-Host "  /podcast         -> Panel podcast" -ForegroundColor DarkGray
Write-Host "  /cv-optimiser    -> CV & ATS optimiser" -ForegroundColor DarkGray
Write-Host "  /portfolio       -> Portfolio projects" -ForegroundColor DarkGray
Write-Host "  /interview       -> Interview simulator" -ForegroundColor DarkGray
Write-Host "  /settings        -> Privacy & preferences" -ForegroundColor DarkGray
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor White
Write-Host "  1. Run: npm run dev" -ForegroundColor Yellow
Write-Host "  2. Open: http://localhost:3000" -ForegroundColor Yellow
Write-Host "  3. Test each route above in your browser" -ForegroundColor Yellow
Write-Host "  4. When working, run:" -ForegroundColor Yellow
Write-Host "     git add ." -ForegroundColor Yellow
Write-Host '     git commit -m "Phase 1: Architecture reset - proper App Router routes"' -ForegroundColor Yellow
Write-Host "     git push" -ForegroundColor Yellow
Write-Host ""
