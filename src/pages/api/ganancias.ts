import type { APIRoute } from 'astro';
import connectDB from '../../lib/mongodb';
import { Producto } from '../../models/Producto';
import { Salida } from '../../models/Salida';

export const GET: APIRoute = async () => {
  try {
    await connectDB();
    
    // Obtener todas las salidas (ventas) con productos poblados
    const salidas = await Salida.find({})
      .populate('productos.producto', 'nombre precio costo')
      .lean();
    
    // Agrupar productos vendidos y calcular ganancias reales
    const productosVendidos = new Map<string, {
      _id: string;
      nombre: string;
      precioVentaTotal: number; // Suma de precio * cantidad para calcular promedio ponderado
      costo: number;
      cantidadVendida: number;
      gananciaTotal: number;
    }>();
    
    // Iterar sobre todas las salidas para acumular datos de productos vendidos
    for (const salida of salidas) {
      for (const item of salida.productos) {
        const productoId = typeof item.producto === 'object' 
          ? (item.producto as any)._id.toString()
          : item.producto.toString();
        
        if (typeof item.producto === 'object') {
          const producto = item.producto as any;
          const precioVenta = item.precio;
          const costo = producto.costo || 0;
          const cantidadVendida = item.cantidad;
          const gananciaPorUnidad = precioVenta - costo;
          const gananciaTotal = gananciaPorUnidad * cantidadVendida;
          
          if (productosVendidos.has(productoId)) {
            const existente = productosVendidos.get(productoId)!;
            existente.cantidadVendida += cantidadVendida;
            existente.gananciaTotal += gananciaTotal;
            // Acumular precio * cantidad para calcular promedio ponderado después
            existente.precioVentaTotal += precioVenta * cantidadVendida;
          } else {
            productosVendidos.set(productoId, {
              _id: productoId,
              nombre: producto.nombre,
              precioVentaTotal: precioVenta * cantidadVendida,
              costo: costo,
              cantidadVendida: cantidadVendida,
              gananciaTotal: gananciaTotal,
            });
          }
        }
      }
    }
    
    // Convertir el Map a array y calcular margen de ganancia
    const ganancias = Array.from(productosVendidos.values()).map(producto => {
      // Calcular precio promedio ponderado
      const precioPromedio = producto.cantidadVendida > 0 
        ? producto.precioVentaTotal / producto.cantidadVendida 
        : 0;
      
      // Calcular ganancia promedio por unidad basada en la ganancia total real
      const gananciaPorUnidadPromedio = producto.cantidadVendida > 0 
        ? producto.gananciaTotal / producto.cantidadVendida 
        : 0;
      
      const margenGanancia = producto.costo > 0 
        ? ((gananciaPorUnidadPromedio / producto.costo) * 100).toFixed(2)
        : '0.00';
      
      return {
        _id: producto._id,
        nombre: producto.nombre,
        precio: Number(precioPromedio.toFixed(2)),
        costo: producto.costo,
        cantidad: producto.cantidadVendida,
        gananciaPorUnidad: gananciaPorUnidadPromedio.toFixed(2),
        gananciaTotal: producto.gananciaTotal.toFixed(2),
        margenGanancia: `${margenGanancia}%`,
      };
    });
    
    // Ordenar por ganancia total descendente
    ganancias.sort((a, b) => parseFloat(b.gananciaTotal) - parseFloat(a.gananciaTotal));
    
    return new Response(JSON.stringify(ganancias), {
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

