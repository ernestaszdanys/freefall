@echo off
set manifestFileName=cache1.manifest
ATTRIB -R %manifestFileName%>NUL
(CD.>%manifestFileName%)2>NUL

echo Manifest file name is: %manifestFileName%

@echo CACHE MANIFEST> %manifestFileName%
@echo.>> %manifestFileName%

@echo #This is a list off all game files>> %manifestFileName%
@echo #Date when the GEN was executed: %date:~10,4%.%date:~4,2%.%date:~7,2%>> %manifestFileName%
@echo #GENERATION NUMBER - %RANDOM%%RANDOM%%RANDOM%>> %manifestFileName%
@echo.>> %manifestFileName%

@echo ##MAIN STUFF>> %manifestFileName%
dir /b "*.html" "*.js">> %manifestFileName%
@echo.>> %manifestFileName%

@echo ##OTHER STUFF>> %manifestFileName%
for /f "delims=" %%a in ('dir /b assets\images\*') do @echo assets\images\%%~a>> %manifestFileName%
@echo.>> %manifestFileName%

for /f "delims=" %%a in ('dir /b js\*.js') do @echo js\%%~a>> %manifestFileName%
@echo.>> %manifestFileName%

@echo NETWORK:>> %manifestFileName%
@echo # All URLs that start with the following lines>> %manifestFileName%
@echo # are whitelisted.>> %manifestFileName%
@echo *>> %manifestFileName%
@echo.>> %manifestFileName%

@echo CACHE:>> %manifestFileName%
@echo # Additional items to cache.>> %manifestFileName%
@echo.>> %manifestFileName%

@echo FALLBACK:>> %manifestFileName%

echo/
start notepad cache1.manifest
PAUSE