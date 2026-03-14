# ============================================================
# SkillBridge SA - Phase 2.1 CV Parser Install
#
# Run from your project root:
#   cd "C:\Users\Tau Mashigo\OneDrive\Desktop\Prompts\Job Seekers\Phase 1\skillbridge-sa-next"
#   powershell -ExecutionPolicy Bypass -File install-phase2-cv.ps1
# ============================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " SkillBridge SA - Phase 2.1 CV Parser" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/2] Extracting files..." -ForegroundColor Yellow
if (Test-Path "phase2-cv.zip") {
    Expand-Archive -Path "phase2-cv.zip" -DestinationPath "." -Force
    Write-Host "  4 files extracted." -ForegroundColor Green
} else {
    Write-Host "  ERROR: phase2-cv.zip not found!" -ForegroundColor Red
    exit 1
}

Write-Host "[2/2] Verifying files..." -ForegroundColor Yellow
$expected = @(
    "src\lib\auth\session.ts",
    "src\app\api\cv\upload\route.ts",
    "src\app\api\cv\parse\route.ts",
    "src\app\(onboarding)\job-input\page.tsx"
)
$missing = @()
foreach ($f in $expected) {
    if (-not (Test-Path $f)) { $missing += $f }
}
if ($missing.Count -eq 0) {
    Write-Host "  All 4 files verified!" -ForegroundColor Green
} else {
    Write-Host "  WARNING: Missing files:" -ForegroundColor Red
    foreach ($m in $missing) { Write-Host "    - $m" -ForegroundColor Red }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Phase 2.1 CV Parser - Installed!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "WHAT CHANGED:" -ForegroundColor White
Write-Host "  - CV upload now sends file to Supabase Storage" -ForegroundColor DarkGray
Write-Host "  - CV parse calls Claude AI to extract structured data" -ForegroundColor DarkGray
Write-Host "  - Generates career narrative summary" -ForegroundColor DarkGray
Write-Host "  - Calculates CV quality score (0-100)" -ForegroundColor DarkGray
Write-Host "  - Real user session (no more demo-user-id)" -ForegroundColor DarkGray
Write-Host "  - Progress indicators during upload/parse" -ForegroundColor DarkGray
Write-Host ""
Write-Host "IMPORTANT - Supabase Storage:" -ForegroundColor Red
Write-Host "  You need a storage bucket called 'cv-uploads' in Supabase." -ForegroundColor Yellow
Write-Host "  Go to supabase.com/dashboard -> Storage -> New Bucket" -ForegroundColor Yellow
Write-Host "  Name: cv-uploads | Private: Yes" -ForegroundColor Yellow
Write-Host ""
Write-Host "TEST:" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor Yellow
Write-Host "  Login -> Job Input -> Upload a real CV (PDF or DOCX)" -ForegroundColor Yellow
Write-Host "  Watch the progress indicators as it uploads and parses" -ForegroundColor Yellow
Write-Host ""
