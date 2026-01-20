import type { APIRoute } from 'astro';
import connectDB from '../../lib/mongodb';
import { Producto } from '../../models/Producto';

export const GET: APIRoute = async () => {
  try {
    await connectDB();
    const productos = await Producto.find({}).sort({ createdAt: -1 });
    return new Response(JSON.stringify(productos), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('❌ Error en GET /api/productos:', error);
    const errorMessage = error?.message || 'Error desconocido al obtener productos';
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    await connectDB();
    const data = await request.json();
    const producto = new Producto(data);
    await producto.save();
    return new Response(JSON.stringify(producto), {
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

export const PUT: APIRoute = async ({ request }) => {
  try {
    await connectDB();
    const { _id, ...data } = await request.json();
    const producto = await Producto.findByIdAndUpdate(_id, data, { new: true, runValidators: true });
    if (!producto) {
      return new Response(JSON.stringify({ error: 'Producto no encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify(producto), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  try {
    await connectDB();
    const { _id } = await request.json();
    const producto = await Producto.findByIdAndDelete(_id);
    if (!producto) {
      return new Response(JSON.stringify({ error: 'Producto no encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ message: 'Producto eliminado' }), {
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

