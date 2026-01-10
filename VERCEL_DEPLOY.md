# Guía de Despliegue en Vercel

## Configuración Completada ✅

El proyecto ya está configurado con el adapter correcto de Vercel (`@astrojs/vercel/serverless`) compatible con Astro 4.x.

## Pasos para Desplegar

### 1. Configurar Variables de Entorno en Vercel

**⚠️ IMPORTANTE**: Debes configurar la variable de entorno `MONGODB_URI` en el dashboard de Vercel.

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Ve a **Settings** → **Environment Variables**
3. Agrega la siguiente variable:

   ```
   Name: MONGODB_URI
   Value: mongodb+srv://Jb_database1:vxVqhNpCrpCacm7F@db1.3enraoz.mongodb.net/inventario?retryWrites=true&w=majority&appName=db1
   ```

4. Selecciona los ambientes: **Production**, **Preview**, y **Development**
5. Haz clic en **Save**

### 2. Verificar Configuración del Proyecto

El proyecto debe tener estas configuraciones automáticas detectadas por Vercel:
- **Framework**: Astro
- **Build Command**: `npm run build`
- **Output Directory**: `.vercel/output` (automático con el adapter)
- **Install Command**: `npm install`

### 3. Desplegar

1. Conecta tu repositorio de GitHub a Vercel (si aún no lo has hecho)
2. Vercel detectará automáticamente que es un proyecto Astro
3. Asegúrate de que las variables de entorno estén configuradas antes del despliegue
4. Haz clic en **Deploy**

### 4. Verificar el Despliegue

Después del despliegue, verifica que:
- Las rutas principales funcionen: `/`, `/entradas`, `/salidas`, `/ganancias`
- Las APIs respondan: `/api/productos`, `/api/entradas`, etc.
- La conexión a MongoDB funcione (verifica los logs en Vercel)

## Solución de Problemas

### Error: "Deployment failed with error"

Si ves este error genérico, necesitas obtener el mensaje de error completo:

**Cómo obtener el error completo:**

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Haz clic en el último deployment (el que falló)
3. En la parte superior, verás el estado: "Building", "Error", etc.
4. Haz clic en **"View Build Logs"** o desplázate hacia abajo hasta ver **"Build Logs"**
5. Busca líneas que contengan:
   - `Error:` o `error:`
   - `Failed` o `failed`
   - `Cannot` o `cannot`
   - Cualquier mensaje en rojo

**Comparte el error completo** para poder diagnosticar el problema específico.

### Errores Comunes y Soluciones

#### Error: "Cannot find module" o "Module not found"

**Posibles causas:**
- Imports incorrectos
- Dependencias faltantes
- Rutas incorrectas

**Solución:**
```bash
# Verificar que todas las dependencias estén instaladas
npm install

# Verificar que el build funciona localmente
npm run build
```

#### Error: "MONGODB_URI is not defined"

**Causa:** Variable de entorno no configurada en Vercel.

**Solución:**
1. Ve a Settings → Environment Variables
2. Agrega `MONGODB_URI` con el valor completo
3. Asegúrate de seleccionar todos los ambientes
4. Haz un nuevo despliegue

#### Error: "TypeError" o errores de TypeScript

**Posibles causas:**
- Tipos incorrectos
- Configuración de TypeScript incorrecta

**Solución:**
```bash
# Verificar errores de TypeScript localmente
npm run build

# Si hay errores, corrígelos antes de hacer push
```

#### Error: "Command 'npm run build' exited with 1"

**Causa:** El build falló durante la compilación.

**Solución:**
1. Revisa los logs del build en Vercel
2. Busca el error específico en los logs
3. Verifica que el build funciona localmente: `npm run build`
4. Corrige los errores encontrados
5. Haz commit y push de las correcciones

### Error 404: NOT_FOUND

Si ves un error 404, verifica:

1. **Variables de entorno configuradas**: 
   - Ve a Settings → Environment Variables
   - Asegúrate de que `MONGODB_URI` esté configurada
   - Haz un nuevo despliegue después de agregar variables

2. **Logs del despliegue**:
   - Ve a tu proyecto en Vercel
   - Click en el último deployment
   - Revisa los "Build Logs" para errores

3. **Rutas API**:
   - Verifica que las rutas `/api/*` estén en `src/pages/api/`
   - Las rutas deben tener la extensión `.ts`

### Error de Conexión a MongoDB

Si la conexión a MongoDB falla:

1. Verifica que la `MONGODB_URI` sea correcta
2. Asegúrate de que tu IP esté permitida en MongoDB Atlas (o usa `0.0.0.0/0` para permitir todas)
3. Verifica los logs de función en Vercel para ver el error exacto

### Warnings y Advertencias

#### Warnings de npm sobre paquetes deprecados

Los warnings como estos son **normales** y no afectan el funcionamiento:

```
npm warn deprecated rimraf@3.0.2
npm warn deprecated npmlog@5.0.1
npm warn deprecated inflight@1.0.6
npm warn deprecated glob@7.2.3
npm warn deprecated gauge@3.0.2
npm warn deprecated are-we-there-yet@2.0.0
```

Estos provienen de dependencias transitivas (dependencias de dependencias) y no afectan tu aplicación.

#### Requisito de Versión de Node.js

Vercel ahora requiere **Node.js 24.x** para Serverless Functions. Node.js 18.x ha sido discontinuado.

**Configuración requerida:**
El proyecto está configurado para usar Node.js 24.x en `package.json`:
```json
"engines": {
  "node": "24.x"
}
```

**Si ves un error sobre Node.js 18.x discontinuado:**
Asegúrate de que `package.json` especifica Node.js 24.x en el campo `engines`. Si recibes este error:
```
Error: Node.js Version "18.x" is discontinued and must be upgraded.
Please set "engines": { "node": "24.x" } in your `package.json` file.
```

**Solución:**
1. Actualiza `package.json` para usar `"node": "24.x"` en el campo `engines`
2. Haz commit y push de los cambios
3. Re-despliega en Vercel

**Versión Local:**
Para coincidir con el entorno de producción, es recomendable usar Node.js 24.x localmente:
- Si usas `nvm` (Node Version Manager):
  ```bash
  nvm install 24
  nvm use 24
  ```

#### Advertencias sobre Módulos No Resueltos

Las advertencias sobre módulos como `kerberos`, `snappy`, `aws4`, `socks`, etc. son **normales** y no afectan el funcionamiento:

```
[@astrojs/vercel] The module "kerberos" couldn't be resolved. This may not be a problem...
[@astrojs/vercel] The module "snappy" couldn't be resolved. This may not be a problem...
```

Son dependencias opcionales de MongoDB y Sharp que no son necesarias para la conexión básica. El mensaje mismo dice "This may not be a problem" (Esto puede no ser un problema).

### ✅ Todo está funcionando correctamente

Si ves estos warnings pero el build termina con "Complete!" o "Build Complete!", significa que todo está funcionando correctamente. Los warnings son solo informativos.

## Configuración Actual

- **Adapter**: `@astrojs/vercel/serverless` (v7.0.0)
- **Output Mode**: `server` (SSR)
- **Node.js Runtime**: 24.x (requerido por Vercel, especificado en `package.json` → `engines`)
- **Versión Node.js Local Recomendada**: 24.x (para coincidir con Vercel)

## Archivos Importantes

- `astro.config.mjs`: Configuración de Astro con adapter de Vercel
- `vercel.json`: Configuración básica de Vercel
- `.env`: NO debe subirse a Git (ya está en `.gitignore`)

