import type { APIRoute } from 'astro';
import connectDB from '../../lib/mongodb';
import { Salida } from '../../models/Salida';
import { Producto } from '../../models/Producto';

export const GET: APIRoute = async () => {
  try {
    await connectDB();
    const salidas = await Salida.find({})
      .populate('productos.producto', 'nombre precio costo')
      .sort({ fecha: -1 })
      .lean();
    
    // Filtrar productos null y limpiar los datos
    const salidasLimpias = salidas.map(salida => ({
      ...salida,
      productos: salida.productos.filter((item: any) => item.producto !== null && item.producto !== undefined)
    }));
    
    return new Response(JSON.stringify(salidasLimpias), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error en GET /api/salidas:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    await connectDB();
    const data = await request.json();
    
    // Validar que todos los productos existan y tengan suficiente cantidad
    for (const item of data.productos) {
      const producto = await Producto.findById(item.producto);
      if (!producto) {
        return new Response(JSON.stringify({ error: `Producto ${item.producto} no encontrado` }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      
      if (producto.cantidad < item.cantidad) {
        return new Response(
          JSON.stringify({ 
            error: `Stock insuficiente para ${producto.nombre}. Disponible: ${producto.cantidad}, Solicitado: ${item.cantidad}` 
          }), 
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
      
      // Actualizar cantidad del producto
      producto.cantidad -= item.cantidad;
      await producto.save();
    }
    
    const salida = new Salida(data);
    await salida.save();
    
    const salidaPopulada = await Salida.findById(salida._id)
      .populate('productos.producto', 'nombre precio costo');
    
    return new Response(JSON.stringify(salidaPopulada), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

