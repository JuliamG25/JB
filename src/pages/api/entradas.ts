import type { APIRoute } from 'astro';
import connectDB from '../../lib/mongodb';
import { Entrada } from '../../models/Entrada';
import { Producto } from '../../models/Producto';

export const GET: APIRoute = async () => {
  try {
    await connectDB();
    const entradas = await Entrada.find({})
      .populate('productos.producto', 'nombre precio costo')
      .sort({ fecha: -1 });
    return new Response(JSON.stringify(entradas), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
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
    
    // Validar que todos los productos existan y actualizar cantidades
    for (const item of data.productos) {
      const producto = await Producto.findById(item.producto);
      if (!producto) {
        return new Response(JSON.stringify({ error: `Producto ${item.producto} no encontrado` }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      
      // Actualizar cantidad del producto
      producto.cantidad += item.cantidad;
      // Actualizar costo si es diferente
      if (item.costo !== undefined) {
        producto.costo = item.costo;
      }
      await producto.save();
    }
    
    const entrada = new Entrada(data);
    await entrada.save();
    
    const entradaPopulada = await Entrada.findById(entrada._id)
      .populate('productos.producto', 'nombre precio costo');
    
    return new Response(JSON.stringify(entradaPopulada), {
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

