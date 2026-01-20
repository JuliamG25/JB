import type { APIRoute } from 'astro';
import connectDB from '../../lib/mongodb';
import { Producto } from '../../models/Producto';
import { Salida } from '../../models/Salida';

export const GET: APIRoute = async ({ url }) => {
  try {
    await connectDB();
    
    // Obtener parámetros de fecha de la URL
    const fechaInicio = url.searchParams.get('fechaInicio');
    const fechaFin = url.searchParams.get('fechaFin');
    
    // Construir filtro de fechas
    const filtroFecha: any = {};
    if (fechaInicio || fechaFin) {
      filtroFecha.fecha = {};
      if (fechaInicio) {
        filtroFecha.fecha.$gte = new Date(fechaInicio);
      }
      if (fechaFin) {
        // Agregar un día completo para incluir el día final
        const fechaFinCompleta = new Date(fechaFin);
        fechaFinCompleta.setHours(23, 59, 59, 999);
        filtroFecha.fecha.$lte = fechaFinCompleta;
      }
    }
    
    // Obtener salidas (ventas) con productos poblados, filtradas por fecha si se proporciona
    const salidas = await Salida.find(filtroFecha)
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
        // Validar que item.producto no sea null o undefined
        if (!item.producto) {
          console.warn('Producto null encontrado en salida:', salida._id);
          continue; // Saltar este item si el producto no existe
        }
        
        const productoId = typeof item.producto === 'object' 
          ? (item.producto as any)?._id?.toString()
          : item.producto?.toString();
        
        // Validar que productoId existe
        if (!productoId) {
          console.warn('Producto ID no válido en salida:', salida._id);
          continue;
        }
        
        if (typeof item.producto === 'object' && item.producto !== null) {
          const producto = item.producto as any;
          
          // Validar que el producto tenga las propiedades necesarias
          if (!producto._id || !producto.nombre) {
            console.warn('Producto incompleto en salida:', salida._id);
            continue;
          }
          
          const precioVenta = item.precio || 0;
          const costo = producto.costo || 0;
          const cantidadVendida = item.cantidad || 0;
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
              nombre: producto.nombre || 'Producto sin nombre',
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
      
      // Calcular rentabilidad: (precio - costo) / precio * 100
      const rentabilidad = precioPromedio > 0 
        ? (((precioPromedio - producto.costo) / precioPromedio) * 100).toFixed(2)
        : '0.00';
      
      return {
        _id: producto._id,
        nombre: producto.nombre,
        precio: Number(precioPromedio.toFixed(2)),
        costo: producto.costo,
        cantidad: producto.cantidadVendida,
        gananciaPorUnidad: gananciaPorUnidadPromedio.toFixed(2),
        gananciaTotal: producto.gananciaTotal.toFixed(2),
        rentabilidad: `${rentabilidad}%`,
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

