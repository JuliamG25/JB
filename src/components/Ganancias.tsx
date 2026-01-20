import { useState, useEffect } from 'react';

interface Ganancia {
  _id: string;
  nombre: string;
  precio: number;
  costo: number;
  cantidad: number;
  gananciaPorUnidad: string;
  gananciaTotal: string;
  margenGanancia: string;
}

export default function Ganancias() {
  const [ganancias, setGanancias] = useState<Ganancia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarGanancias();
  }, []);

  const cargarGanancias = async () => {
    try {
      const res = await fetch('/api/ganancias');
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: `Error ${res.status}: ${res.statusText}` }));
        throw new Error(errorData.error || `Error al cargar ganancias: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      
      // Verificar si la respuesta contiene un error
      if (data.error) {
        throw new Error(data.error);
      }
      
      setGanancias(Array.isArray(data) ? data : []);
      setError(null);
    } catch (error: any) {
      console.error('Error al cargar ganancias:', error);
      setGanancias([]);
      setError(error.message || 'Error desconocido al cargar ganancias');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600 mb-6"></div>
          <p className="text-purple-700 text-xl font-bold">Analizando ganancias de belleza...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-2xl font-bold text-red-600 mb-2">Error al cargar datos</h3>
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              cargarGanancias();
            }}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const gananciaTotalGeneral = ganancias.reduce(
    (sum, g) => sum + parseFloat(g.gananciaTotal),
    0
  );
  const gananciaPromedio = ganancias.length > 0 ? gananciaTotalGeneral / ganancias.length : 0;

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-5xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-fuchsia-600 bg-clip-text text-transparent mb-2">
          💰 Análisis de Ganancias
        </h2>
        <p className="text-purple-700 mt-2 text-lg font-medium">Ganancias reales basadas en productos vendidos</p>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-fuchsia-600 rounded-3xl shadow-2xl p-8 text-white transform hover:scale-110 transition-all duration-300 border-2 border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-base font-bold mb-2">Ganancia Total Potencial</p>
              <p className="text-4xl font-extrabold">${gananciaTotalGeneral.toFixed(2)}</p>
            </div>
            <div className="text-6xl opacity-90">💰</div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-pink-500 via-purple-500 to-fuchsia-500 rounded-3xl shadow-2xl p-8 text-white transform hover:scale-110 transition-all duration-300 border-2 border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100 text-base font-bold mb-2">Promedio por Producto</p>
              <p className="text-4xl font-extrabold">${gananciaPromedio.toFixed(2)}</p>
            </div>
            <div className="text-6xl opacity-90">📊</div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-fuchsia-500 via-pink-500 to-purple-500 rounded-3xl shadow-2xl p-8 text-white transform hover:scale-110 transition-all duration-300 border-2 border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-fuchsia-100 text-base font-bold mb-2">Total de Productos</p>
              <p className="text-4xl font-extrabold">{ganancias.length}</p>
            </div>
            <div className="text-6xl opacity-90">💄</div>
          </div>
        </div>
      </div>

      {ganancias.length === 0 ? (
        <div className="text-center py-24 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl shadow-xl border-2 border-dashed border-purple-300">
          <div className="text-7xl mb-6 animate-pulse">📊</div>
          <p className="text-purple-700 text-2xl font-bold mb-3">No hay productos vendidos</p>
          <p className="text-pink-600 text-base font-medium">Registra algunas ventas primero para ver las ganancias</p>
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border-2 border-purple-200/50">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-purple-100">
              <thead className="bg-gradient-to-r from-purple-500 via-pink-500 to-fuchsia-500">
                <tr>
                  <th className="px-8 py-5 text-left text-sm font-bold text-white uppercase tracking-wider">
                    💋 Producto
                  </th>
                  <th className="px-8 py-5 text-left text-sm font-bold text-white uppercase tracking-wider">
                    💰 Precio Venta
                  </th>
                  <th className="px-8 py-5 text-left text-sm font-bold text-white uppercase tracking-wider">
                    📊 Costo
                  </th>
                  <th className="px-8 py-5 text-left text-sm font-bold text-white uppercase tracking-wider">
                    📦 Cantidad
                  </th>
                  <th className="px-8 py-5 text-left text-sm font-bold text-white uppercase tracking-wider">
                    ✨ Ganancia/Unidad
                  </th>
                  <th className="px-8 py-5 text-left text-sm font-bold text-white uppercase tracking-wider">
                    💎 Ganancia Total
                  </th>
                  <th className="px-8 py-5 text-left text-sm font-bold text-white uppercase tracking-wider">
                    📈 Margen %
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/50 divide-y divide-purple-100">
                {ganancias.map((ganancia, index) => {
                  const gananciaPorUnidad = parseFloat(ganancia.gananciaPorUnidad);
                  const esNegativa = gananciaPorUnidad < 0;
                  const esPositiva = gananciaPorUnidad > 0;
                  
                  return (
                    <tr
                      key={ganancia._id}
                      className={`hover:bg-gradient-to-r transition-all duration-300 group ${
                        esNegativa
                          ? 'hover:from-red-50 hover:via-pink-50 hover:to-red-50'
                          : esPositiva
                          ? 'hover:from-green-50 hover:via-emerald-50 hover:to-green-50'
                          : 'hover:from-purple-50 hover:via-pink-50 hover:to-fuchsia-50'
                      }`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-12 w-12 rounded-2xl flex items-center justify-center text-white font-bold mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300 ${
                            esNegativa
                              ? 'bg-gradient-to-br from-red-500 to-pink-500'
                              : esPositiva
                              ? 'bg-gradient-to-br from-green-500 to-emerald-500'
                              : 'bg-gradient-to-br from-purple-500 via-pink-500 to-fuchsia-500'
                          }`}>
                            {ganancia.nombre.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-base font-bold text-purple-900">{ganancia.nombre}</div>
                            <div className="text-xs text-purple-500 font-medium">ID: {ganancia._id.slice(-6)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="text-base font-bold text-green-600">${ganancia.precio.toFixed(2)}</div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="text-base font-semibold text-purple-700">${ganancia.costo.toFixed(2)}</div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-white shadow-md">
                          {ganancia.cantidad}
                        </span>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold shadow-md ${
                          esNegativa
                            ? 'bg-gradient-to-r from-red-400 to-pink-500 text-white'
                            : esPositiva
                            ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'
                            : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                        }`}>
                          ${ganancia.gananciaPorUnidad}
                        </span>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold shadow-md ${
                          esNegativa
                            ? 'bg-gradient-to-r from-red-400 to-pink-500 text-white'
                            : esPositiva
                            ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'
                            : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                        }`}>
                          ${ganancia.gananciaTotal}
                        </span>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold shadow-md ${
                          esNegativa
                            ? 'bg-gradient-to-r from-red-400 to-pink-500 text-white'
                            : parseFloat(ganancia.margenGanancia) > 50
                            ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'
                            : parseFloat(ganancia.margenGanancia) > 20
                            ? 'bg-gradient-to-r from-purple-400 to-pink-400 text-white'
                            : 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white'
                        }`}>
                          {ganancia.margenGanancia}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

