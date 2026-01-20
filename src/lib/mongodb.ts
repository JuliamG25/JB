import mongoose from 'mongoose';

// Opciones del cliente para la API estable de MongoDB
const clientOptions = {
  serverApi: {
    version: '1' as const,
    strict: true,
    deprecationErrors: true,
  },
  bufferCommands: false,
};

// Función para obtener la URI de MongoDB en tiempo de ejecución
// En Astro con SSR, import.meta.env está disponible en runtime
// En Vercel, las variables de entorno se pasan como import.meta.env
function getMongoDBUri(): string {
  // En Astro con SSR, import.meta.env está disponible en runtime
  // En Vercel, las variables de entorno se pasan como import.meta.env
  const uri = import.meta.env.MONGODB_URI || 
    (typeof process !== 'undefined' && process.env ? process.env.MONGODB_URI : undefined) ||
    'mongodb+srv://<db_username>:<db_password>@db1.3enraoz.mongodb.net/inventario?retryWrites=true&w=majority&appName=db1';
  
  return uri;
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB(): Promise<typeof mongoose> {
  try {
    // Verificar si ya hay una conexión activa
    if (cached.conn) {
      // Verificar que la conexión sigue activa
      if (mongoose.connection.readyState === 1) {
        return cached.conn;
      }
      // Si la conexión se perdió, resetear el cache
      cached.conn = null;
    }

    if (!cached.promise) {
      const MONGODB_URI = getMongoDBUri();
      
      // Validar en tiempo de ejecución (cuando realmente se necesita la conexión)
      if (!MONGODB_URI || MONGODB_URI.includes('<db_username>') || MONGODB_URI.includes('<db_password>')) {
        const errorMessage = 'MONGODB_URI no está configurada correctamente.\n\n' +
          'Por favor configura la variable de entorno MONGODB_URI en Vercel:\n' +
          '1. Ve a Settings → Environment Variables\n' +
          '2. Agrega la variable MONGODB_URI con tu connection string de MongoDB Atlas\n' +
          '3. Selecciona todos los ambientes (Production, Preview, Development)\n' +
          '4. Haz un nuevo despliegue';
        console.error('❌ Error de configuración:', errorMessage);
        throw new Error(errorMessage);
      }
      
      console.log('🔄 Intentando conectar a MongoDB...');
      cached.promise = mongoose.connect(MONGODB_URI, clientOptions).then(async (mongoose) => {
        // Verificar la conexión con un ping
        try {
          if (mongoose.connection.db) {
            await mongoose.connection.db.admin().command({ ping: 1 });
            console.log('✅ Pinged your deployment. You successfully connected to MongoDB!');
          } else {
            console.log('✅ Conectado a MongoDB');
          }
        } catch (error) {
          console.error('❌ Error al hacer ping a MongoDB:', error);
          throw error;
        }
        return mongoose;
      }).catch((error) => {
        // Limpiar la promesa en caso de error para permitir reintentos
        cached.promise = null;
        console.error('❌ Error al conectar a MongoDB:', error);
        throw error;
      });
    }

    try {
      cached.conn = await cached.promise;
    } catch (e: any) {
      cached.promise = null;
      console.error('❌ Error al obtener la conexión:', e);
      // Proporcionar un mensaje de error más útil
      const errorMessage = e.message || 'Error desconocido al conectar a MongoDB';
      throw new Error(`Error de conexión a MongoDB: ${errorMessage}`);
    }

    return cached.conn;
  } catch (error: any) {
    console.error('❌ Error en connectDB:', error);
    throw error;
  }
}

export default connectDB;

