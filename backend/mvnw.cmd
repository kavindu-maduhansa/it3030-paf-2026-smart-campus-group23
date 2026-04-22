@ECHO OFF
SETLOCAL

set "MVNW_DIR=%~dp0"
if "%MVNW_DIR:~-1%"=="\" set "MVNW_DIR=%MVNW_DIR:~0,-1%"
set "WRAPPER_JAR=%MVNW_DIR%\.mvn\wrapper\maven-wrapper.jar"

if not exist "%WRAPPER_JAR%" (
  echo Error: Maven wrapper JAR not found: "%WRAPPER_JAR%"
  exit /b 1
)

where java >NUL 2>&1
if errorlevel 1 (
  echo Error: JAVA_HOME is not set and no 'java' command could be found in PATH.
  exit /b 1
)

set "JAVA_EXE=java"
if not "%JAVA_HOME%"=="" if exist "%JAVA_HOME%\bin\java.exe" set "JAVA_EXE=%JAVA_HOME%\bin\java.exe"

"%JAVA_EXE%" -Dmaven.multiModuleProjectDirectory="%MVNW_DIR%" -classpath "%WRAPPER_JAR%" org.apache.maven.wrapper.MavenWrapperMain %*
ENDLOCAL
