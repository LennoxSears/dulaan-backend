@echo off
setlocal enabledelayedexpansion
REM ============================================================================
REM Google Cloud PeerJS Cleanup Script for Windows
REM This script removes PeerJS-related App Engine and Cloud Run deployments
REM ============================================================================

echo.
echo ============================================================================
echo Google Cloud Cleanup Script
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
    pause
    exit /b 0
)

echo.
echo Setting up environment...

REM Get current project ID
for /f "tokens=*" %%i in ('gcloud config get-value project 2^>nul') do set PROJECT_ID=%%i

if "%PROJECT_ID%"=="" (
    echo ERROR: No Google Cloud project is set.
    echo Please run: gcloud config set project YOUR_PROJECT_ID
    pause
    exit /b 1
)

echo Current project: %PROJECT_ID%
echo.

REM ============================================================================
echo Step 1: Cleaning up PeerJS Cloud Run services...
REM ============================================================================

echo Checking for PeerJS Cloud Run services...

REM Check for dulaan-peerjs-server service specifically
gcloud run services describe dulaan-peerjs-server --region=europe-west1 >nul 2>&1
if %errorlevel%==0 (
    echo Deleting Cloud Run service: dulaan-peerjs-server
    gcloud run services delete dulaan-peerjs-server --region=europe-west1 --quiet
) else (
    echo No dulaan-peerjs-server Cloud Run service found in europe-west1.
)

REM Check other common regions
gcloud run services describe dulaan-peerjs-server --region=us-central1 >nul 2>&1
if %errorlevel%==0 (
    echo Deleting Cloud Run service: dulaan-peerjs-server (us-central1)
    gcloud run services delete dulaan-peerjs-server --region=us-central1 --quiet
) else (
    echo No dulaan-peerjs-server Cloud Run service found in us-central1.
)

echo.

REM ============================================================================
echo Step 2: Cleaning up PeerJS Container Registry images...
REM ============================================================================

echo Checking for PeerJS container images...

REM Check for dulaan-peerjs-server images specifically
gcloud container images list --repository=gcr.io/%PROJECT_ID% --format="value(name)" 2>nul | findstr dulaan-peerjs-server > temp_peerjs_images.txt

if exist temp_peerjs_images.txt (
    for /f %%i in (temp_peerjs_images.txt) do (
        echo Deleting PeerJS container image: %%i
        gcloud container images delete %%i --force-delete-tags --quiet
    )
    del temp_peerjs_images.txt
) else (
    echo No PeerJS container images found.
)

echo.

REM ============================================================================
echo Step 3: Cleaning up PeerJS App Engine service...
REM ============================================================================

echo Checking for PeerJS App Engine service...

REM Check if there's a peerjs service (not default)
gcloud app services describe peerjs >nul 2>&1
if %errorlevel%==0 (
    echo Deleting App Engine service: peerjs
    gcloud app services delete peerjs --quiet
) else (
    echo No peerjs App Engine service found.
)

REM Check for PeerJS versions in default service
echo Checking for PeerJS versions in default service...
gcloud app versions list --service=default --format="value(id)" 2>nul | findstr dulaan > temp_peerjs_versions.txt

if exist temp_peerjs_versions.txt (
    for /f %%i in (temp_peerjs_versions.txt) do (
        echo Checking if version %%i is serving traffic...
        for /f %%j in ('gcloud app versions list --service=default --filter="id=%%i AND traffic_split>0" --format="value(id)" 2^>nul') do (
            if "%%j"=="%%i" (
                echo Keeping serving version: %%i
            ) else (
                echo Deleting non-serving PeerJS version: %%i
                gcloud app versions delete %%i --service=default --quiet
            )
        )
    )
    del temp_peerjs_versions.txt
) else (
    echo No PeerJS versions found in default service.
)

echo.

REM ============================================================================
echo Step 4: Cleaning up PeerJS Cloud Build triggers...
REM ============================================================================

echo Checking for PeerJS Cloud Build triggers...

REM Look for triggers with dulaan or peerjs in the name
for /f "tokens=1,2" %%a in ('gcloud builds triggers list --format="value(id,name)" 2^>nul') do (
    echo %%b | findstr /i "dulaan peerjs" >nul
    if !errorlevel!==0 (
        echo Deleting Cloud Build trigger: %%b (%%a)
        gcloud builds triggers delete %%a --quiet
    )
)

echo.

REM ============================================================================
echo Step 5: Cleaning up PeerJS firewall rules...
REM ============================================================================

echo Checking for PeerJS firewall rules...

echo.

REM ============================================================================
echo Step 6: Cleaning up PeerJS SSL certificates...
REM ============================================================================

echo Checking for PeerJS SSL certificates...

gcloud compute firewall-rules describe allow-peerjs-server >nul 2>&1
if %errorlevel%==0 (
    echo Deleting firewall rule: allow-peerjs-server
    gcloud compute firewall-rules delete allow-peerjs-server --quiet
) else (
    echo Firewall rule allow-peerjs-server not found.
)

gcloud compute firewall-rules describe allow-http-8080 >nul 2>&1
if %errorlevel%==0 (
    echo Deleting firewall rule: allow-http-8080
    gcloud compute firewall-rules delete allow-http-8080 --quiet
) else (
    echo Firewall rule allow-http-8080 not found.
)

echo.

REM Look for certificates with dulaan or peerjs in the name
for /f %%i in ('gcloud compute ssl-certificates list --format="value(name)" 2^>nul') do (
    echo %%i | findstr /i "dulaan peerjs" >nul
    if !errorlevel!==0 (
        echo Deleting PeerJS SSL certificate: %%i
        gcloud compute ssl-certificates delete %%i --quiet
    )
)

echo.

REM ============================================================================
echo Step 7: Verification
REM ============================================================================

echo Verifying PeerJS cleanup...
echo.

echo Checking for remaining PeerJS Cloud Run services:
gcloud run services describe dulaan-peerjs-server --region=europe-west1 >nul 2>&1
if %errorlevel%==0 (
    echo WARNING: dulaan-peerjs-server still exists in europe-west1
) else (
    echo OK: No dulaan-peerjs-server in europe-west1
)

echo.
echo Checking for remaining PeerJS container images:
gcloud container images list --repository=gcr.io/%PROJECT_ID% --format="value(name)" 2>nul | findstr dulaan-peerjs-server >nul
if %errorlevel%==0 (
    echo WARNING: PeerJS container images still exist
) else (
    echo OK: No PeerJS container images found
)

echo.
echo Checking for PeerJS App Engine service:
gcloud app services describe peerjs >nul 2>&1
if %errorlevel%==0 (
    echo WARNING: peerjs App Engine service still exists
) else (
    echo OK: No peerjs App Engine service found
)

echo.
echo Checking PeerJS firewall rules:
gcloud compute firewall-rules describe allow-peerjs-server >nul 2>&1
if %errorlevel%==0 (
    echo WARNING: allow-peerjs-server firewall rule still exists
) else (
    echo OK: No allow-peerjs-server firewall rule found
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
echo To completely disable App Engine (IRREVERSIBLE):
echo   gcloud app disable
echo.
echo To check billing:
echo   gcloud billing accounts list
echo.
echo ============================================================================

pause