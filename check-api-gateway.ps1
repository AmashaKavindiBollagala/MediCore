Write-Host "🔍 Checking API Gateway connectivity..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Check if API Gateway is running
Write-Host "1. Testing API Gateway health..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/health" -Method GET -ErrorAction Stop
    Write-Host "   ✅ API Gateway is running" -ForegroundColor Green
    Write-Host "   Response: $($response.status)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ API Gateway is NOT running or not responding" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 2: Check if Auth Service is running
Write-Host "2. Testing Auth Service health..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/health" -Method GET -ErrorAction Stop
    Write-Host "   ✅ Auth Service is running" -ForegroundColor Green
    Write-Host "   Response: $($response.status)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Auth Service is NOT running" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 3: Test direct auth-service login
Write-Host "3. Testing direct Auth Service login..." -ForegroundColor Yellow
try {
    $body = @{
        email = "dilsharalhthilakarathne@gmail.com"
        password = "test123"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method POST -ContentType "application/json" -Body $body -ErrorAction Stop
    Write-Host "   ✅ Auth Service login endpoint works" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "   ✅ Auth Service login endpoint works (invalid credentials expected)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Auth Service login failed" -ForegroundColor Red
        Write-Host "   Error: $_" -ForegroundColor Red
    }
}

Write-Host ""

# Test 4: Test API Gateway proxy to auth-service
Write-Host "4. Testing API Gateway → Auth Service proxy..." -ForegroundColor Yellow
try {
    $body = @{
        email = "test@test.com"
        password = "test"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:8080/auth/login" -Method POST -ContentType "application/json" -Body $body -ErrorAction Stop
    Write-Host "   ✅ API Gateway proxy works" -ForegroundColor Green
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $errorContent = $_.ErrorDetails.Message
    
    if ($statusCode -eq 502) {
        Write-Host "   ❌ API Gateway proxy FAILED (502 Bad Gateway)" -ForegroundColor Red
        Write-Host "   ⚠️  The API Gateway cannot reach Auth Service!" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "   SOLUTION: Restart the API Gateway" -ForegroundColor Cyan
        Write-Host "   1. Find the API Gateway terminal and press Ctrl+C" -ForegroundColor Gray
        Write-Host "   2. Run: cd c:\Users\HP\Desktop\MediCore\api-gateway" -ForegroundColor Gray
        Write-Host "   3. Run: node index.js" -ForegroundColor Gray
    } else {
        Write-Host "   ⚠️  API Gateway proxy responded with status: $statusCode" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "DIAGNOSIS COMPLETE" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
