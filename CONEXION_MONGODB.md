# 🔌 Guía Completa: Conexión a MongoDB Atlas

## Paso 4: Obtener y Configurar la Connection String (Cadena de Conexión)

### 📍 Ubicación en MongoDB Atlas

1. **Inicia sesión en MongoDB Atlas**
   - Ve a: https://cloud.mongodb.com/
   - Ingresa con tus credenciales

2. **Navega a tu Cluster**
   - En el panel izquierdo, verás tu cluster (probablemente llamado "db1")
   - Haz clic en el botón azul **"Connect"** que está en la tarjeta del cluster

3. **Selecciona el Método de Conexión**
   - Verás varios métodos:
     - ✅ **"Drivers"** o **"Connect your application"** ← **USA ESTE**
     - MongoDB Shell
     - MongoDB Compass
     - VS Code Extension

### 📋 Detalles del Paso 4: Connection String

#### **4.1 Seleccionar Driver**

Cuando selecciones "Drivers" o "Connect your application", verás:

```
1. Choose your driver version
   ┌─────────────────────────────┐
   │ Driver:    Node.js          │
   │ Version:   7.0 or later     │ ← Selecciona esta opción
   └─────────────────────────────┘
```

**Selecciona:**
- **Driver:** Node.js
- **Version:** 7.0 or later (o la versión más reciente)

**🤔 ¿Por qué Node.js si usamos Mongoose?**

Mongoose es un **ODM (Object Document Mapper)** que funciona **sobre** el driver oficial de MongoDB para Node.js. 

```
┌─────────────────────────────────┐
│   Tu Aplicación (Astro/React)   │
└──────────────┬──────────────────┘
               │
               │ import mongoose from 'mongoose'
               ▼
┌─────────────────────────────────┐
│         Mongoose (ODM)          │  ← Capa de abstracción (modelos, esquemas, validación)
└──────────────┬──────────────────┘
               │
               │ Usa internamente
               ▼
┌─────────────────────────────────┐
│   MongoDB Driver para Node.js   │  ← Driver oficial (comunicación directa con MongoDB)
└──────────────┬──────────────────┘
               │
               │ Connection String
               ▼
┌─────────────────────────────────┐
│      MongoDB Atlas (Cloud)      │
└─────────────────────────────────┘
```

**Explicación:**
- **Mongoose** = Librería de alto nivel que facilita trabajar con MongoDB (modelos, esquemas, validación, etc.)
- **Driver de Node.js** = Librería de bajo nivel que se comunica directamente con MongoDB
- **Mongoose internamente usa el driver de Node.js**, por eso aunque uses Mongoose, Atlas necesita la información del driver base (Node.js)

Cuando instalas Mongoose (`npm install mongoose`), automáticamente instala el driver de MongoDB para Node.js como dependencia. Por eso en Atlas seleccionas "Node.js", aunque en tu código uses Mongoose.

#### **4.2 Copiar la Connection String**

MongoDB Atlas te mostrará la cadena exacta:

```
mongodb+srv://<db_username>:<db_password>@db1.3enraoz.mongodb.net/?appName=db1
```

**⚠️ IMPORTANTE:** Esta cadena tiene dos placeholders que DEBES reemplazar:
- `<db_username>` → Tu usuario de MongoDB
- `<db_password>` → Tu contraseña de MongoDB

#### **4.3 Personalizar la Connection String**

**Tu cadena base desde Atlas:**
```
mongodb+srv://<db_username>:<db_password>@db1.3enraoz.mongodb.net/?appName=db1
```

**Pasos para personalizar:**

1. **Reemplaza `<db_username>`** con tu usuario de MongoDB
   - Ejemplo: Si tu usuario es `juliamsteven_db_user`
   - Reemplaza `<db_username>` por `juliamsteven_db_user`

2. **Reemplaza `<db_password>`** con tu contraseña real del usuario de MongoDB
   - Ejemplo: Si tu contraseña es `MiPassword2024!`
   - Reemplaza `<db_password>` por `MiPassword2024!`

3. **Agrega el nombre de la base de datos** (opcional pero recomendado)
   - Después del último `/`, antes de `?appName=db1`
   - Agrega: `/inventario`

4. **Agrega parámetros adicionales** (recomendado)
   - Reemplaza `?appName=db1` por `?retryWrites=true&w=majority&appName=db1`

**Ejemplo Completo:**

```
ANTES (de Atlas):
mongodb+srv://<db_username>:<db_password>@db1.3enraoz.mongodb.net/?appName=db1

PASO 1 - Reemplazar usuario:
mongodb+srv://juliamsteven_db_user:<db_password>@db1.3enraoz.mongodb.net/?appName=db1

PASO 2 - Reemplazar contraseña:
mongodb+srv://juliamsteven_db_user:MiPassword2024!@db1.3enraoz.mongodb.net/?appName=db1

PASO 3 - Agregar base de datos:
mongodb+srv://juliamsteven_db_user:MiPassword2024!@db1.3enraoz.mongodb.net/inventario?appName=db1

PASO 4 - Agregar parámetros:
DESPUÉS (final - lista para usar):
mongodb+srv://juliamsteven_db_user:MiPassword2024!@db1.3enraoz.mongodb.net/inventario?retryWrites=true&w=majority&appName=db1
```

### 📁 4.4 Crear el Archivo .env en tu Proyecto

1. **Crea un archivo llamado `.env`** en la raíz de tu proyecto (misma carpeta donde está `package.json`)

2. **Agrega la siguiente línea:**

```env
MONGODB_URI=mongodb+srv://juliamsteven_db_user:TU_CONTRASEÑA_AQUI@db1.3enraoz.mongodb.net/inventario?retryWrites=true&w=majority&appName=db1
```

3. **Reemplaza `TU_CONTRASEÑA_AQUI`** con tu contraseña real (sin los signos `<>`)

### 🎯 Estructura Final de la Connection String

Desglose de la cadena de conexión:

```
mongodb+srv://
    ↓
[juliamsteven_db_user]           ← Usuario de MongoDB
    ↓
[:TU_CONTRASEÑA]                  ← Contraseña (sin < >)
    ↓
[@db1.3enraoz.mongodb.net]        ← Host del cluster
    ↓
[/inventario]                     ← Nombre de la base de datos
    ↓
[?retryWrites=true                ← Parámetros opcionales
 &w=majority
 &appName=db1]
```

### ✅ Verificación

**Para verificar que todo está correcto:**

1. ✅ El archivo `.env` existe en la raíz del proyecto
2. ✅ La contraseña está correctamente escrita (sin espacios)
3. ✅ No hay caracteres especiales sin codificar en la contraseña
   - Si tu contraseña tiene caracteres especiales, puede necesitar codificación URL
   - Ejemplo: `@` se codifica como `%40`, `#` como `%23`, etc.
4. ✅ La cadena completa está en una sola línea en el archivo `.env`

### 🔒 Caracteres Especiales en Contraseñas

Si tu contraseña tiene caracteres especiales, codifícalos:

| Carácter | Codificación |
|----------|--------------|
| `@`      | `%40`        |
| `#`      | `%23`        |
| `$`      | `%24`        |
| `%`      | `%25`        |
| `&`      | `%26`        |
| `+`      | `%2B`        |
| `=`      | `%3D`        |
| `?`      | `%3F`        |
| ` `      | `%20`        |

**Ejemplo:**
- Contraseña: `Mi@Pass#123`
- Codificada: `Mi%40Pass%23123`
- Connection String: `mongodb+srv://usuario:Mi%40Pass%23123@cluster.mongodb.net/inventario?...`

### 🚀 Probar la Conexión

Una vez configurado el `.env`, ejecuta:

```bash
npm run dev
```

Deberías ver en la consola:
```
✅ Pinged your deployment. You successfully connected to MongoDB!
```

Si ves un error, revisa:
- La contraseña en el `.env`
- Los permisos de red en Atlas (Network Access)
- El usuario existe en Database Access

