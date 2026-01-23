import { useState, useEffect } from 'react';

interface Ganancia {
  _id: string;
  nombre: string;
  precio: number;
  costo: number;
  cantidad: number;
  gananciaPorUnidad: string;
  gananciaTotal: string;
  rentabilidad: string;
}

export default function Ganancias() {
  const [ganancias, setGanancias] = useState<Ganancia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  useEffect(() => {
    cargarGanancias();
  }, []);

  const cargarGanancias = async () => {
    try {
      // Construir URL con parámetros de fecha si existen
      let url = '/api/ganancias';
      const params = new URLSearchParams();
      if (fechaInicio) params.append('fechaInicio', fechaInicio);
      if (fechaFin) params.append('fechaFin', fechaFin);
      if (params.toString()) {
        url += '?' + params.toString();
      }
      
      const res = await fetch(url);
      
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
          <p className="text-gray-600 text-xl font-bold">Analizando ganancias de belleza...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-2xl font-bold text-gray-600 mb-2">Error al cargar datos</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              cargarGanancias();
            }}
            className="bg-gradient-to-r from-gray-400 to-gray-500 text-white px-6 py-3 rounded-xl font-bold hover:from-gray-500 hover:to-gray-600 transition-all"
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

  const aplicarFiltros = () => {
    setLoading(true);
    cargarGanancias();
  };

  const limpiarFiltros = () => {
    setFechaInicio('');
    setFechaFin('');
    setLoading(true);
    setTimeout(() => {
      cargarGanancias();
    }, 100);
  };

  return (
    <div className="space-y-6 px-2 sm:px-0">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-gray-500 via-gray-400 to-gray-500 bg-clip-text text-transparent mb-2">
          💰 Análisis de Ganancias
        </h2>
        <p className="text-gray-600 mt-2 text-sm sm:text-base md:text-lg font-medium">Ganancias reales basadas en productos vendidos</p>
      </div>

      {/* Filtros de fecha */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 border-2 border-gray-200/50">
        <h3 className="text-lg sm:text-xl font-bold text-gray-600 mb-3 sm:mb-4 flex items-center space-x-2">
          <span>📅</span>
          <span>Filtrar por Fechas</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-600 mb-1 sm:mb-2">Fecha Inicio</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-4 focus:ring-gray-300 focus:border-gray-400 transition-all duration-300 font-medium text-sm sm:text-base"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-600 mb-1 sm:mb-2">Fecha Fin</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-4 focus:ring-gray-300 focus:border-gray-400 transition-all duration-300 font-medium text-sm sm:text-base"
            />
          </div>
          <div className="flex items-end sm:col-span-2 lg:col-span-1">
            <button
              onClick={aplicarFiltros}
              className="w-full bg-gradient-to-r from-gray-400 to-gray-500 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl hover:from-gray-500 hover:to-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 sm:hover:scale-110 font-bold text-sm sm:text-base"
            >
              🔍 Aplicar Filtros
            </button>
          </div>
          <div className="flex items-end sm:col-span-2 lg:col-span-1">
            <button
              onClick={limpiarFiltros}
              className="w-full bg-gradient-to-r from-gray-400 to-gray-500 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl hover:from-gray-500 hover:to-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 sm:hover:scale-110 font-bold text-sm sm:text-base"
            >
              🗑️ Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-fuchsia-600 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 text-white transform hover:scale-105 sm:hover:scale-110 transition-all duration-300 border-2 border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-100 text-sm sm:text-base font-bold mb-2">Ganancia Total Potencial</p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold">${gananciaTotalGeneral.toFixed(2)}</p>
            </div>
            <div className="text-4xl sm:text-5xl md:text-6xl opacity-90">💰</div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-gray-400 via-gray-500 to-gray-400 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 text-white transform hover:scale-105 sm:hover:scale-110 transition-all duration-300 border-2 border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-100 text-sm sm:text-base font-bold mb-2">Promedio por Producto</p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold">${gananciaPromedio.toFixed(2)}</p>
            </div>
            <div className="text-4xl sm:text-5xl md:text-6xl opacity-90">📊</div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-gray-400 via-gray-500 to-gray-400 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 text-white transform hover:scale-105 sm:hover:scale-110 transition-all duration-300 border-2 border-white/20 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-fuchsia-100 text-sm sm:text-base font-bold mb-2">Total de Productos</p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold">{ganancias.length}</p>
            </div>
            <div className="text-4xl sm:text-5xl md:text-6xl opacity-90">💄</div>
          </div>
        </div>
      </div>

      {ganancias.length === 0 ? (
        <div className="text-center py-12 sm:py-16 md:py-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl sm:rounded-3xl shadow-xl border-2 border-dashed border-gray-300 px-4">
          <div className="text-5xl sm:text-6xl md:text-7xl mb-4 sm:mb-6 animate-pulse">📊</div>
          <p className="text-gray-600 text-xl sm:text-2xl font-bold mb-2 sm:mb-3">No hay productos vendidos</p>
          <p className="text-gray-500 text-sm sm:text-base font-medium">Registra algunas ventas primero para ver las ganancias</p>
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border-2 border-gray-200/50">
          {/* Vista móvil: Cards */}
          <div className="block sm:hidden p-4 space-y-4">
            {ganancias.map((ganancia, index) => {
              const gananciaPorUnidad = parseFloat(ganancia.gananciaPorUnidad);
              const esNegativa = gananciaPorUnidad < 0;
              const esPositiva = gananciaPorUnidad > 0;
              
              return (
                <div
                  key={ganancia._id}
                  className={`bg-gradient-to-r rounded-xl p-4 border-2 ${
                    esNegativa
                      ? 'from-gray-50 via-gray-100 to-gray-50 border-gray-200'
                      : esPositiva
                      ? 'from-gray-50 via-gray-100 to-gray-50 border-gray-200'
                      : 'from-purple-50 via-pink-50 to-fuchsia-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center mb-3">
                    <div className={`flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold mr-3 shadow-lg ${
                      esNegativa
                        ? 'bg-gradient-to-br from-gray-400 to-gray-500'
                        : esPositiva
                        ? 'bg-gradient-to-br from-gray-400 to-gray-500'
                        : 'bg-gradient-to-br from-gray-400 via-gray-500 to-gray-400'
                    }`}>
                      {ganancia.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-gray-700 truncate">{ganancia.nombre}</div>
                      <div className="text-xs text-gray-500 font-medium">ID: {ganancia._id.slice(-6)}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500 font-semibold">Precio:</span>
                      <span className="ml-1 text-gray-600 font-bold">${ganancia.precio.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 font-semibold">Costo:</span>
                      <span className="ml-1 text-gray-600 font-semibold">${ganancia.costo.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 font-semibold">Cantidad:</span>
                      <span className="ml-1 inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-white">
                        {ganancia.cantidad}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 font-semibold">Rentabilidad:</span>
                      <span className={`ml-1 inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                        esNegativa
                          ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                          : parseFloat(ganancia.rentabilidad) > 50
                          ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                          : parseFloat(ganancia.rentabilidad) > 20
                          ? 'bg-gradient-to-r from-purple-400 to-pink-400 text-white'
                          : 'bg-gradient-to-r from-gray-300 to-gray-400 text-white'
                      }`}>
                        {ganancia.rentabilidad}%
                      </span>
                    </div>
                    <div className="col-span-2 pt-2 border-t border-gray-200">
                      <span className="text-gray-500 font-semibold">Ganancia/Unidad:</span>
                      <span className={`ml-1 inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                        esNegativa
                          ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                          : esPositiva
                          ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                          : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                      }`}>
                        ${ganancia.gananciaPorUnidad}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500 font-semibold">Ganancia Total:</span>
                      <span className={`ml-1 inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                        esNegativa
                          ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                          : esPositiva
                          ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                          : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                      }`}>
                        ${ganancia.gananciaTotal}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Vista desktop: Tabla */}
          <div className="hidden sm:block overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-purple-100">
                <thead className="bg-gradient-to-r from-gray-400 via-gray-500 to-gray-400">
                  <tr>
                    <th className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 text-left text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                      💋 Producto
                    </th>
                    <th className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 text-left text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                      💰 Precio Venta
                    </th>
                    <th className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 text-left text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                      📊 Costo
                    </th>
                    <th className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 text-left text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                      📦 Cantidad
                    </th>
                    <th className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 text-left text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                      ✨ Ganancia/Unidad
                    </th>
                    <th className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 text-left text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                      💎 Ganancia Total
                    </th>
                    <th className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 text-left text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                      📈 Rentabilidad %
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
                            ? 'hover:from-gray-50 hover:via-gray-100 hover:to-gray-50'
                            : esPositiva
                            ? 'hover:from-gray-50 hover:via-gray-100 hover:to-gray-50'
                            : 'hover:from-gray-50 hover:via-gray-100 hover:to-gray-50'
                        }`}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-bold mr-3 sm:mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300 ${
                              esNegativa
                                ? 'bg-gradient-to-br from-gray-400 to-gray-500'
                                : esPositiva
                                ? 'bg-gradient-to-br from-gray-400 to-gray-500'
                                : 'bg-gradient-to-br from-gray-400 via-gray-500 to-gray-400'
                            }`}>
                              {ganancia.nombre.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm sm:text-base font-bold text-gray-700">{ganancia.nombre}</div>
                              <div className="text-xs text-gray-500 font-medium">ID: {ganancia._id.slice(-6)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 whitespace-nowrap">
                          <div className="text-sm sm:text-base font-bold text-gray-600">${ganancia.precio.toFixed(2)}</div>
                        </td>
                        <td className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 whitespace-nowrap">
                          <div className="text-sm sm:text-base font-semibold text-gray-600">${ganancia.costo.toFixed(2)}</div>
                        </td>
                        <td className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-white shadow-md">
                            {ganancia.cantidad}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-md ${
                            esNegativa
                              ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                              : esPositiva
                              ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                              : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                          }`}>
                            ${ganancia.gananciaPorUnidad}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-md ${
                            esNegativa
                              ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                              : esPositiva
                              ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                              : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                          }`}>
                            ${ganancia.gananciaTotal}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-md ${
                            esNegativa
                              ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                              : parseFloat(ganancia.rentabilidad) > 50
                              ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                              : parseFloat(ganancia.rentabilidad) > 20
                              ? 'bg-gradient-to-r from-purple-400 to-pink-400 text-white'
                              : 'bg-gradient-to-r from-gray-300 to-gray-400 text-white'
                          }`}>
                            {ganancia.rentabilidad}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

