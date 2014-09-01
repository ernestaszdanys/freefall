@echo off
ATTRIB -R FileNames.txt>NUL
(CD.>FileNames.txt)2>NUL

@echo #This is a list off all game files > FileNames.txt
@echo Date when the GEN was executed: %date:~10,4%.%date:~4,2%.%date:~7,2%>> FileNames.txt
@echo #%RANDOM%%RANDOM%%RANDOM% -GENERATION NUMBER >> FileNames.txt
@echo.>> FileNames.txt

@echo ############################## >> FileNames.txt
@echo #Files in primarry dir       #>> FileNames.txt
@echo ############################## >> FileNames.txt
dir /b "*" >> FileNames.txt
@echo PRINTED PRIMARRY DIR INFO TO TEXT FILE
@echo.>> FileNames.txt

@echo ############################## >> FileNames.txt
@echo #All game images             #>> FileNames.txt
@echo ############################## >> FileNames.txt
dir /b "assets\images\*.png" >> FileNames.txt
@echo PRINTED IMAGES INFO DIR TO TEXT FILE
@echo.>> FileNames.txt

@echo ############################## >> FileNames.txt
@echo #All javascript files        # >> FileNames.txt
@echo ############################## >> FileNames.txt
dir /b "js\*.js" >> FileNames.txt
@echo PRINTED JAVASCRIPT INFO DIR TO TEXT FILE
@echo.>> FileNames.txt
@echo.>> FileNames.txt
@echo.>> FileNames.txt
@echo.>> FileNames.txt

@echo ############################## >> FileNames.txt
@echo #Some more advaced stuff here#>> FileNames.txt
@echo ############################## >> FileNames.txt
@echo.>> FileNames.txt
dir /s /b *. >> FileNames.txt
@echo.>> FileNames.txt
dir /s /b "*" >> FileNames.txt
@echo.>> FileNames.txt
dir "*" >> FileNames.txt
@echo.>> FileNames.txt
dir "assets\images\*" >> FileNames.txt
@echo.>> FileNames.txt
dir "js\*" >> FileNames.txt
@echo PRINTED OTHER USLESS STUFF...






@echo.>> output.txt
@echo.>> output.txt
@echo.>> output.txt
@echo.>> output.txt
@echo.>> output.txt


set FileName=dir  /b *


dir /d /b * >> output.txt
echo 

start notepad output.txt

echo/
PAUSE