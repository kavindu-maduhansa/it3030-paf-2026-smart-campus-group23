@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements.  See the NOTICE file
@REM distributed with this work for additional information
@REM regarding copyright ownership.  The ASF licenses this file
@REM to you under the Apache License, Version 2.0 (the
@REM "License"); you may not use this file except in compliance
@REM with the License.  You may obtain a copy of the License at
@REM
@REM    http://www.apache.org/licenses/LICENSE-2.0
@REM
@REM    Unless required by applicable law or agreed to in writing,
@REM    software distributed under the License is distributed on an
@REM    "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
@REM    KIND, either express or implied.  See the License for the
@REM    specific language governing permissions and limitations
@REM    under the License.
@REM ----------------------------------------------------------------------------

@REM ----------------------------------------------------------------------------
@REM Apache Maven Wrapper startup batch script, version 3.3.2
@REM
@REM Required ENV vars:
@REM JAVA_HOME - location of a JDK home dir
@REM
@REM Optional ENV vars
@REM MAVEN_BATCH_ECHO - set to 'on' to enable the echoing of the batch commands
@REM MAVEN_BATCH_PAUSE - set to 'on' to wait for a keystroke before ending
@REM MAVEN_OPTS - parameters passed to the Java VM when running Maven
@REM     e.g. to debug Maven itself, use
@REM     set MAVEN_OPTS=-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=y,address=8000
@REM MAVEN_SKIP_RC - flag to disable loading of mavenrc files
@REM ----------------------------------------------------------------------------

@REM Begin all REM lines with '@' in case MAVEN_BATCH_ECHO is 'on'
@echo off
@REM set title of command prompt window
title %0
@REM enable echoing by setting MAVEN_BATCH_ECHO to 'on'
@if "%MAVEN_BATCH_ECHO%" == "on"  echo %MAVEN_BATCH_ECHO%

@REM set %HOME% to equivalent of $HOME
if "%HOME%" == "" (set "HOME=%HOMEDRIVE%%HOMEPATH%")

@REM Execute a user defined script before this one
if not "%MAVEN_SKIP_RC%" == "on" (
  if exist "%PROGRAMDATA%\mavenrc.cmd" call "%PROGRAMDATA%\mavenrc.cmd" %*
  if exist "%USERPROFILE%\mavenrc.cmd" call "%USERPROFILE%\mavenrc.cmd" %*
  if exist "%HOME%\mavenrc.cmd" call "%HOME%\mavenrc.cmd" %*
)

@REM Check for a local .mvn directory
set MAVEN_PROJECTBASEDIR=%MAVEN_BASEDIR%
if not "%MAVEN_PROJECTBASEDIR%" == "" goto endReadBaseDir

set EXEC_DIR=%CD%
set WDIR=%EXEC_DIR%
:findBaseDir
if exist "%WDIR%\.mvn" set "MAVEN_PROJECTBASEDIR=%WDIR%" & goto endReadBaseDir
set "WDIR=%WDIR%\.."
if /i "%WDIR%" == "%CD:~0,3%" goto endReadBaseDir
goto findBaseDir

:endReadBaseDir

set "WRAPPER_JAR=%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar"
set "WRAPPER_PROPERTIES=%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.properties"

@REM Extension to allow automatically downloading the maven-wrapper.jar from Maven-central
@REM This allows using the maven wrapper in projects that prohibit checking in binary data.
if exist "%WRAPPER_JAR%" goto endDownload
echo Couldn't find %WRAPPER_JAR%, downloading it ...

set "DOWNLOAD_URL=https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.3.2/maven-wrapper-3.3.2.jar"
set "WRAPPER_SHA256SUM="

if not exist "%WRAPPER_PROPERTIES%" (
  echo Couldn't find %WRAPPER_PROPERTIES%, using default %DOWNLOAD_URL%
  goto :runDownload
)

for /f "tokens=2 delims==" %%i in ('findstr /i "wrapperUrl" "%WRAPPER_PROPERTIES%"') do set "DOWNLOAD_URL=%%i"

set "DOWNLOAD_URL=%DOWNLOAD_URL:"=%"
set "DOWNLOAD_URL=%DOWNLOAD_URL: =%"

:runDownload
echo Downloading from: %DOWNLOAD_URL%

@REM check for powershell
set "PS_CMD=powershell -Command"
where powershell >nul 2>&1
if %ERRORLEVEL% equ 0 goto :powershellDownload

@REM check for curl
where curl >nul 2>&1
if %ERRORLEVEL% equ 0 (
  curl -s -L -o "%WRAPPER_JAR%" "%DOWNLOAD_URL%"
  goto :endDownload
)

@REM check for wget
where wget >nul 2>&1
if %ERRORLEVEL% equ 0 (
  wget -q -O "%WRAPPER_JAR%" "%DOWNLOAD_URL%"
  goto :endDownload
)

echo Failed to find powershell, curl or wget. 
echo Please download %DOWNLOAD_URL% and place it in %WRAPPER_JAR% to continue.
exit /b 1

:powershellDownload
set "DOWNLOAD_COMMAND=$ErrorActionPreference = 'Stop'; [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; $webClient = New-Object System.Net.WebClient; if ($env:MVNW_USERNAME -and $env:MVNW_PASSWORD) { $Credentials = New-Object System.Net.NetworkCredential($env:MVNW_USERNAME, $env:MVNW_PASSWORD); $webClient.Credentials = $Credentials; } $webClient.DownloadFile('%DOWNLOAD_URL%', '%WRAPPER_JAR%')"
%PS_CMD% "%DOWNLOAD_COMMAND%"
if %ERRORLEVEL% neq 0 (
  echo Failed to download %WRAPPER_JAR%
  exit /b 1
)

:endDownload

@REM If specified, validate the SHA-256 sum of the Maven wrapper jar file
set "WRAPPER_SHA256SUM="
for /f "tokens=2 delims==" %%i in ('findstr /i "wrapperSha256Sum" "%WRAPPER_PROPERTIES%" 2^>nul') do set "WRAPPER_SHA256SUM=%%i"
if not defined WRAPPER_SHA256SUM goto :endSha256
set "WRAPPER_SHA256SUM=%WRAPPER_SHA256SUM:"=%"
set "WRAPPER_SHA256SUM=%WRAPPER_SHA256SUM: =%"
if "%WRAPPER_SHA256SUM%" == "" goto :endSha256
set "PS_SHA256_COMMAND=$ErrorActionPreference = 'Stop'; if ((Get-FileHash -Path '%WRAPPER_JAR%' -Algorithm SHA256).Hash -ne '%WRAPPER_SHA256SUM%') { Write-Error 'Error: Failed to validate Maven wrapper SHA-256, your Maven wrapper might be compromised. Investigate or delete %WRAPPER_JAR% to attempt a clean download.' }"
%PS_CMD% "%PS_SHA256_COMMAND%"
if %ERRORLEVEL% neq 0 exit /b 1

:endSha256

@REM Find JAVA_HOME
if not "%JAVA_HOME%" == "" goto gotJavaHome

set "JAVA_EXE=java.exe"
%JAVA_EXE% -version >nul 2>&1
if "%ERRORLEVEL%" == "0" goto gotJavaExe

echo.
echo Error: JAVA_HOME is not defined correctly.
echo   We cannot execute %JAVA_EXE%
echo.
exit /b 1

:gotJavaExe
set "JAVA_CMD=java.exe"
goto runm

:gotJavaHome
set "JAVA_HOME=%JAVA_HOME:"=%"
set "JAVA_CMD=%JAVA_HOME%\bin\java.exe"

if exist "%JAVA_CMD%" goto runm

echo.
echo Error: JAVA_HOME is set to an invalid directory.
echo JAVA_HOME = "%JAVA_HOME%"
echo Please set the JAVA_HOME variable in your environment to match the
echo location of your Java installation.
echo.
exit /b 1

:runm
set "MAVEN_OPTS=%MAVEN_OPTS% -Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR%"
set WRAPPER_LAUNCHER=org.apache.maven.wrapper.MavenWrapperMain

@REM Provide a "standardized" way to retrieve the CLI args that will
@REM work with both Windows and non-Windows executions.
set MAVEN_CMD_LINE_ARGS=%*

"%JAVA_CMD%" ^
  %MAVEN_OPTS% ^
  %MAVEN_DEBUG_OPTS% ^
  -classpath "%WRAPPER_JAR%" ^
  "%WRAPPER_LAUNCHER%" ^
  %MAVEN_CONFIG% ^
  %*
if ERRORLEVEL 1 exit /b 1

:end
@if "%MAVEN_BATCH_PAUSE%" == "on" pause

if "%MAVEN_TERMINATE_CMD%" == "on" exit %ERRORLEVEL%

exit /b %ERRORLEVEL%
