# FlowForge - Setup Script
# Run this script after cloning the repo

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  FlowForge - Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "[1/4] Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "  Node.js $nodeVersion detected" -ForegroundColor Green
} catch {
    Write-Host "  ERROR: Node.js is not installed. Install from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "[2/4] Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ERROR: npm install failed" -ForegroundColor Red
    exit 1
}
Write-Host "  Dependencies installed" -ForegroundColor Green

# Create .env file
Write-Host "[3/4] Environment variables..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "  .env file created from .env.example" -ForegroundColor Green
    Write-Host "  IMPORTANT: Edit .env with your Supabase credentials!" -ForegroundColor Yellow
} else {
    Write-Host "  .env already exists" -ForegroundColor Green
}

# Build
Write-Host "[4/4] Building..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ERROR: Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "  Build successful!" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "  1. Edit .env with your Supabase URL and anon key" -ForegroundColor White
Write-Host "  2. Run the SQL in supabase/migrations/00001_schema.sql in Supabase SQL Editor" -ForegroundColor White
Write-Host "  3. Run 'npm run dev' to start locally" -ForegroundColor White
Write-Host "  4. Push to GitHub to deploy to Pages automatically" -ForegroundColor White
