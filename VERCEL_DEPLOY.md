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

#### Warning sobre Node.js 20

```
[WARN] [@astrojs/vercel/serverless] Your project is being built for Node.js 20 as the runtime, which is currently in beta for Vercel Serverless Functions.
```

Este warning es **solo informativo**. Node.js 20 funciona perfectamente en Vercel, aunque esté en beta para Serverless Functions. El proyecto funcionará correctamente.

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
- **Node.js Runtime**: 20.x (automático en Vercel)

## Archivos Importantes

- `astro.config.mjs`: Configuración de Astro con adapter de Vercel
- `vercel.json`: Configuración básica de Vercel
- `.env`: NO debe subirse a Git (ya está en `.gitignore`)

