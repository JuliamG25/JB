import mongoose from 'mongoose';

// Connection String desde MongoDB Atlas
// Reemplaza <db_username> y <db_password> con tus credenciales reales en el archivo .env
// Durante el build, esta puede no estar disponible, así que la validamos solo en tiempo de ejecución
function getMongoDBUri(): string {
  // En Astro con SSR, import.meta.env está disponible en runtime
  // En Vercel, las variables de entorno se pasan como import.meta.env
  const uri = import.meta.env.MONGODB_URI || 
    (typeof process !== 'undefined' && process.env ? process.env.MONGODB_URI : undefined) ||
    'mongodb+srv://<db_username>:<db_password>@db1.3enraoz.mongodb.net/inventario?retryWrites=true&w=majority&appName=db1';
  
  return uri;
}

// Opciones del cliente para la API estable de MongoDB
const clientOptions = {
  serverApi: {
    version: '1' as const,
    strict: true,
    deprecationErrors: true,
  },
  bufferCommands: false,
};

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
        '2. Agrega: MONGODB_URI=mongodb+srv://Jb_database1:vxVqhNpCrpCacm7F@db1.3enraoz.mongodb.net/inventario?retryWrites=true&w=majority&appName=db1\n' +
        '3. Selecciona todos los ambientes (Production, Preview, Development)\n' +
        '4. Haz un nuevo despliegue';
      throw new Error(errorMessage);
    }
    
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
        console.error('Error al hacer ping a MongoDB:', error);
        throw error;
      }
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('Error al conectar a MongoDB:', e);
    throw e;
  }

  return cached.conn;
}

export default connectDB;

