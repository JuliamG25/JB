@echo off
echo Limpiando cache y reconstruyendo...
rmdir /s /q .astro
rmdir /s /q dist
echo Cache limpiado. Ahora ejecuta: npm run dev

