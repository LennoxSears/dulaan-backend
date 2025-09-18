@echo off
REM ============================================================================
REM Google Cloud Cleanup Script for Windows
REM This script removes all App Engine and Cloud Run deployments
REM ============================================================================

echo.
echo ============================================================================
echo Google Cloud Cleanup Script
echo ============================================================================
echo.
echo This script will delete:
echo - All Cloud Run services
echo - All App Engine versions (except serving default)
echo - All Container Registry images
echo - All Cloud Build triggers
echo - Related firewall rules
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
echo Step 1: Cleaning up Cloud Run services...
REM ============================================================================

echo Listing Cloud Run services...
gcloud run services list --region=europe-west1 --format="value(metadata.name)" > temp_services.txt 2>nul

if exist temp_services.txt (
    for /f %%i in (temp_services.txt) do (
        echo Deleting Cloud Run service: %%i
        gcloud run services delete %%i --region=europe-west1 --quiet
    )
    del temp_services.txt
) else (
    echo No Cloud Run services found.
)

echo.

REM ============================================================================
echo Step 2: Cleaning up Cloud Run services in other regions...
REM ============================================================================

echo Checking us-central1...
gcloud run services list --region=us-central1 --format="value(metadata.name)" > temp_services_us.txt 2>nul

if exist temp_services_us.txt (
    for /f %%i in (temp_services_us.txt) do (
        echo Deleting Cloud Run service in us-central1: %%i
        gcloud run services delete %%i --region=us-central1 --quiet
    )
    del temp_services_us.txt
)

echo Checking europe-west3...
gcloud run services list --region=europe-west3 --format="value(metadata.name)" > temp_services_ew3.txt 2>nul

if exist temp_services_ew3.txt (
    for /f %%i in (temp_services_ew3.txt) do (
        echo Deleting Cloud Run service in europe-west3: %%i
        gcloud run services delete %%i --region=europe-west3 --quiet
    )
    del temp_services_ew3.txt
)

echo.

REM ============================================================================
echo Step 3: Cleaning up Container Registry images...
REM ============================================================================

echo Listing container images...
gcloud container images list --format="value(name)" > temp_images.txt 2>nul

if exist temp_images.txt (
    for /f %%i in (temp_images.txt) do (
        echo Deleting container image: %%i
        gcloud container images delete %%i --force-delete-tags --quiet
    )
    del temp_images.txt
) else (
    echo No container images found.
)

echo.

REM ============================================================================
echo Step 4: Cleaning up App Engine versions...
REM ============================================================================

echo Listing App Engine versions...
gcloud app versions list --format="value(id,service,traffic_split)" > temp_versions.txt 2>nul

if exist temp_versions.txt (
    for /f "tokens=1,2,3 delims= " %%a in (temp_versions.txt) do (
        if "%%c"=="0.0" (
            echo Deleting App Engine version: %%a in service: %%b
            gcloud app versions delete %%a --service=%%b --quiet
        ) else (
            echo Keeping serving version: %%a in service: %%b (traffic: %%c^)
        )
    )
    del temp_versions.txt
) else (
    echo No App Engine versions found.
)

echo.

REM ============================================================================
echo Step 5: Cleaning up Cloud Build triggers...
REM ============================================================================

echo Listing Cloud Build triggers...
gcloud builds triggers list --format="value(id)" > temp_triggers.txt 2>nul

if exist temp_triggers.txt (
    for /f %%i in (temp_triggers.txt) do (
        echo Deleting Cloud Build trigger: %%i
        gcloud builds triggers delete %%i --quiet
    )
    del temp_triggers.txt
) else (
    echo No Cloud Build triggers found.
)

echo.

REM ============================================================================
echo Step 6: Cleaning up firewall rules...
REM ============================================================================

echo Checking for PeerJS related firewall rules...

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

REM ============================================================================
echo Step 7: Cleaning up SSL certificates...
REM ============================================================================

echo Listing SSL certificates...
gcloud compute ssl-certificates list --format="value(name)" > temp_certs.txt 2>nul

if exist temp_certs.txt (
    for /f %%i in (temp_certs.txt) do (
        echo Deleting SSL certificate: %%i
        gcloud compute ssl-certificates delete %%i --quiet
    )
    del temp_certs.txt
) else (
    echo No SSL certificates found.
)

echo.

REM ============================================================================
echo Step 8: Verification
REM ============================================================================

echo Verifying cleanup...
echo.

echo Cloud Run services remaining:
gcloud run services list --format="table(metadata.name,status.url)" 2>nul

echo.
echo Container images remaining:
gcloud container images list --format="table(name)" 2>nul

echo.
echo App Engine versions:
gcloud app versions list --format="table(id,service,traffic_split)" 2>nul

echo.
echo Cloud Build triggers remaining:
gcloud builds triggers list --format="table(id,name)" 2>nul

echo.

REM ============================================================================
echo Cleanup completed!
REM ============================================================================

echo.
echo ============================================================================
echo CLEANUP SUMMARY
echo ============================================================================
echo.
echo The following have been cleaned up:
echo - Cloud Run services in all regions
echo - Container Registry images
echo - Non-serving App Engine versions
echo - Cloud Build triggers
echo - PeerJS related firewall rules
echo - SSL certificates
echo.
echo IMPORTANT NOTES:
echo - App Engine application itself cannot be deleted (only disabled)
echo - Check your billing dashboard for any remaining charges
echo - Some logs and monitoring data may still exist
echo - Default App Engine version was preserved if it was serving traffic
echo.
echo To completely disable App Engine (IRREVERSIBLE):
echo   gcloud app disable
echo.
echo To check billing:
echo   gcloud billing accounts list
echo.
echo ============================================================================

pause