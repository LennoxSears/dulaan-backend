@echo off
setlocal enabledelayedexpansion

REM ============================================================================
REM Google Cloud PeerJS Cleanup Script for Windows (.bat)
REM This script removes PeerJS-related App Engine and Cloud Run deployments
REM ============================================================================

echo.
echo ============================================================================
echo Google Cloud PeerJS Cleanup Script
echo ============================================================================
echo.
echo This script will delete PeerJS-related resources:
echo - PeerJS Cloud Run services (dulaan-peerjs-server)
echo - PeerJS App Engine services and versions
echo - PeerJS Container Registry images
echo - PeerJS Cloud Build triggers
echo - PeerJS firewall rules
echo.
echo WARNING: This action cannot be undone!
echo.
set /p CONFIRM="Are you sure you want to continue? (y/N): "
if /i not "%CONFIRM%"=="y" (
    echo Operation cancelled.
    goto :end
)

echo.
echo Setting up environment...

REM Get current project ID
for /f "tokens=*" %%i in ('gcloud config get-value project 2^>nul') do set PROJECT_ID=%%i

if "%PROJECT_ID%"=="" (
    echo ERROR: No Google Cloud project is set.
    echo Please run: gcloud config set project YOUR_PROJECT_ID
    goto :end
)

echo Current project: %PROJECT_ID%
echo.

REM ============================================================================
echo Step 1: Cleaning up PeerJS Cloud Run services...
REM ============================================================================

echo Checking for dulaan-peerjs-server in europe-west1...
gcloud run services describe dulaan-peerjs-server --region=europe-west1 >nul 2>&1
if !errorlevel!==0 (
    echo Deleting Cloud Run service: dulaan-peerjs-server (europe-west1)
    gcloud run services delete dulaan-peerjs-server --region=europe-west1 --quiet
    if !errorlevel!==0 (
        echo SUCCESS: Deleted dulaan-peerjs-server from europe-west1
    ) else (
        echo ERROR: Failed to delete dulaan-peerjs-server from europe-west1
    )
) else (
    echo No dulaan-peerjs-server found in europe-west1
)

echo Checking for dulaan-peerjs-server in us-central1...
gcloud run services describe dulaan-peerjs-server --region=us-central1 >nul 2>&1
if !errorlevel!==0 (
    echo Deleting Cloud Run service: dulaan-peerjs-server (us-central1)
    gcloud run services delete dulaan-peerjs-server --region=us-central1 --quiet
    if !errorlevel!==0 (
        echo SUCCESS: Deleted dulaan-peerjs-server from us-central1
    ) else (
        echo ERROR: Failed to delete dulaan-peerjs-server from us-central1
    )
) else (
    echo No dulaan-peerjs-server found in us-central1
)

echo.

REM ============================================================================
echo Step 2: Cleaning up PeerJS Container Registry images...
REM ============================================================================

echo Checking for dulaan-peerjs-server container images...
set FOUND_IMAGES=0

for /f "tokens=*" %%i in ('gcloud container images list --repository^=gcr.io/%PROJECT_ID% --format^="value(name)" 2^>nul') do (
    echo %%i | findstr "dulaan-peerjs-server" >nul
    if !errorlevel!==0 (
        set FOUND_IMAGES=1
        echo Deleting container image: %%i
        gcloud container images delete %%i --force-delete-tags --quiet
        if !errorlevel!==0 (
            echo SUCCESS: Deleted %%i
        ) else (
            echo ERROR: Failed to delete %%i
        )
    )
)

if !FOUND_IMAGES!==0 (
    echo No dulaan-peerjs-server container images found
)

echo.

REM ============================================================================
echo Step 3: Cleaning up PeerJS App Engine service...
REM ============================================================================

echo Checking for peerjs App Engine service...
gcloud app services describe peerjs >nul 2>&1
if !errorlevel!==0 (
    echo Deleting App Engine service: peerjs
    gcloud app services delete peerjs --quiet
    if !errorlevel!==0 (
        echo SUCCESS: Deleted peerjs App Engine service
    ) else (
        echo ERROR: Failed to delete peerjs App Engine service
    )
) else (
    echo No peerjs App Engine service found
)

echo Checking for PeerJS versions in default App Engine service...
set FOUND_VERSIONS=0

for /f "tokens=*" %%i in ('gcloud app versions list --service^=default --format^="value(id)" 2^>nul') do (
    echo %%i | findstr "dulaan" >nul
    if !errorlevel!==0 (
        set FOUND_VERSIONS=1
        echo Checking if version %%i is serving traffic...
        
        REM Check if this version has traffic
        for /f "tokens=*" %%j in ('gcloud app versions list --service^=default --filter^="id^=%%i AND traffic_split^>0" --format^="value(id)" 2^>nul') do (
            if "%%j"=="%%i" (
                echo KEEPING serving version: %%i (has traffic)
                goto :skip_version
            )
        )
        
        echo Deleting non-serving PeerJS version: %%i
        gcloud app versions delete %%i --service=default --quiet
        if !errorlevel!==0 (
            echo SUCCESS: Deleted version %%i
        ) else (
            echo ERROR: Failed to delete version %%i
        )
        
        :skip_version
    )
)

if !FOUND_VERSIONS!==0 (
    echo No PeerJS versions found in default App Engine service
)

echo.

REM ============================================================================
echo Step 4: Cleaning up PeerJS Cloud Build triggers...
REM ============================================================================

echo Checking for PeerJS Cloud Build triggers...
set FOUND_TRIGGERS=0

for /f "tokens=1,2*" %%a in ('gcloud builds triggers list --format^="value(id,name)" 2^>nul') do (
    echo %%b | findstr /i "dulaan peerjs" >nul
    if !errorlevel!==0 (
        set FOUND_TRIGGERS=1
        echo Deleting Cloud Build trigger: %%b (%%a)
        gcloud builds triggers delete %%a --quiet
        if !errorlevel!==0 (
            echo SUCCESS: Deleted trigger %%b
        ) else (
            echo ERROR: Failed to delete trigger %%b
        )
    )
)

if !FOUND_TRIGGERS!==0 (
    echo No PeerJS Cloud Build triggers found
)

echo.

REM ============================================================================
echo Step 5: Cleaning up PeerJS firewall rules...
REM ============================================================================

echo Checking for allow-peerjs-server firewall rule...
gcloud compute firewall-rules describe allow-peerjs-server >nul 2>&1
if !errorlevel!==0 (
    echo Deleting firewall rule: allow-peerjs-server
    gcloud compute firewall-rules delete allow-peerjs-server --quiet
    if !errorlevel!==0 (
        echo SUCCESS: Deleted allow-peerjs-server firewall rule
    ) else (
        echo ERROR: Failed to delete allow-peerjs-server firewall rule
    )
) else (
    echo No allow-peerjs-server firewall rule found
)

echo Checking for allow-http-8080 firewall rule...
gcloud compute firewall-rules describe allow-http-8080 >nul 2>&1
if !errorlevel!==0 (
    echo Deleting firewall rule: allow-http-8080
    gcloud compute firewall-rules delete allow-http-8080 --quiet
    if !errorlevel!==0 (
        echo SUCCESS: Deleted allow-http-8080 firewall rule
    ) else (
        echo ERROR: Failed to delete allow-http-8080 firewall rule
    )
) else (
    echo No allow-http-8080 firewall rule found
)

echo.

REM ============================================================================
echo Step 6: Cleaning up PeerJS SSL certificates...
REM ============================================================================

echo Checking for PeerJS SSL certificates...
set FOUND_CERTS=0

for /f "tokens=*" %%i in ('gcloud compute ssl-certificates list --format^="value(name)" 2^>nul') do (
    echo %%i | findstr /i "dulaan peerjs" >nul
    if !errorlevel!==0 (
        set FOUND_CERTS=1
        echo Deleting SSL certificate: %%i
        gcloud compute ssl-certificates delete %%i --quiet
        if !errorlevel!==0 (
            echo SUCCESS: Deleted SSL certificate %%i
        ) else (
            echo ERROR: Failed to delete SSL certificate %%i
        )
    )
)

if !FOUND_CERTS!==0 (
    echo No PeerJS SSL certificates found
)

echo.

REM ============================================================================
echo Step 7: Verification
REM ============================================================================

echo Verifying PeerJS cleanup...
echo.

echo Checking for remaining PeerJS Cloud Run services:
gcloud run services describe dulaan-peerjs-server --region=europe-west1 >nul 2>&1
if !errorlevel!==0 (
    echo WARNING: dulaan-peerjs-server still exists in europe-west1
) else (
    echo OK: No dulaan-peerjs-server in europe-west1
)

gcloud run services describe dulaan-peerjs-server --region=us-central1 >nul 2>&1
if !errorlevel!==0 (
    echo WARNING: dulaan-peerjs-server still exists in us-central1
) else (
    echo OK: No dulaan-peerjs-server in us-central1
)

echo.
echo Checking for remaining PeerJS container images:
set REMAINING_IMAGES=0
for /f "tokens=*" %%i in ('gcloud container images list --repository^=gcr.io/%PROJECT_ID% --format^="value(name)" 2^>nul') do (
    echo %%i | findstr "dulaan-peerjs-server" >nul
    if !errorlevel!==0 (
        set REMAINING_IMAGES=1
    )
)

if !REMAINING_IMAGES!==1 (
    echo WARNING: PeerJS container images still exist
) else (
    echo OK: No PeerJS container images found
)

echo.
echo Checking for PeerJS App Engine service:
gcloud app services describe peerjs >nul 2>&1
if !errorlevel!==0 (
    echo WARNING: peerjs App Engine service still exists
) else (
    echo OK: No peerjs App Engine service found
)

echo.
echo Checking PeerJS firewall rules:
gcloud compute firewall-rules describe allow-peerjs-server >nul 2>&1
if !errorlevel!==0 (
    echo WARNING: allow-peerjs-server firewall rule still exists
) else (
    echo OK: No allow-peerjs-server firewall rule found
)

gcloud compute firewall-rules describe allow-http-8080 >nul 2>&1
if !errorlevel!==0 (
    echo WARNING: allow-http-8080 firewall rule still exists
) else (
    echo OK: No allow-http-8080 firewall rule found
)

echo.

REM ============================================================================
echo Cleanup completed!
REM ============================================================================

echo.
echo ============================================================================
echo CLEANUP SUMMARY
echo ============================================================================
echo.
echo The following PeerJS resources have been cleaned up:
echo - PeerJS Cloud Run services
echo - PeerJS Container Registry images  
echo - PeerJS App Engine services and versions
echo - PeerJS Cloud Build triggers
echo - PeerJS firewall rules
echo - PeerJS SSL certificates
echo.
echo IMPORTANT NOTES:
echo - Only PeerJS-related resources were targeted for deletion
echo - Other App Engine services and Cloud Run services were preserved
echo - Cloud Functions were not touched
echo - Check your billing dashboard for any remaining charges
echo - Some logs and monitoring data may still exist
echo.
echo To check billing:
echo   gcloud billing accounts list
echo.
echo ============================================================================

:end
echo.
echo Press any key to exit...
pause >nul