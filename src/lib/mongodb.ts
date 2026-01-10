import mongoose from 'mongoose';

// Connection String desde MongoDB Atlas
// Reemplaza <db_username> y <db_password> con tus credenciales reales en el archivo .env
const MONGODB_URI = import.meta.env.MONGODB_URI || 'mongodb+srv://<db_username>:<db_password>@db1.3enraoz.mongodb.net/inventario?retryWrites=true&w=majority&appName=db1';

if (!MONGODB_URI || MONGODB_URI.includes('<db_username>') || MONGODB_URI.includes('<db_password>')) {
  throw new Error('Por favor define la variable MONGODB_URI en el archivo .env con tu usuario y contraseña reales');
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

