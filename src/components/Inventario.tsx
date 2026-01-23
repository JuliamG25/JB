import { useState, useEffect, type FormEvent } from 'react';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

interface Producto {
  _id?: string;
  nombre: string;
  precio: number;
  cantidad: number;
  costo: number;
  codigoBarras?: string;
}

export default function Inventario() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  const [formData, setFormData] = useState<Producto>({
    nombre: '',
    precio: 0,
    cantidad: 0,
    costo: 0,
    codigoBarras: '',
  });

  useEffect(() => {
    cargarProductos();
  }, []);

  // Atajos de teclado para Inventario
  useKeyboardShortcuts([
    {
      key: 'n',
      handler: () => {
        if (!showModal) {
          resetForm();
          setShowModal(true);
        }
      },
      description: 'Nuevo producto',
    },
    {
      key: 'Escape',
      handler: () => {
        if (showModal) {
          setShowModal(false);
          resetForm();
        }
      },
      description: 'Cerrar modal',
    },
  ], !loading);

  const cargarProductos = async () => {
    try {
      const res = await fetch('/api/productos');
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: `Error ${res.status}: ${res.statusText}` }));
        throw new Error(errorData.error || `Error al cargar productos: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      
      // Verificar si la respuesta contiene un error
      if (data.error) {
        throw new Error(data.error);
      }
      
      setProductos(Array.isArray(data) ? data : []);
      setError(null);
    } catch (error: any) {
      console.error('Error al cargar productos:', error);
      setProductos([]);
      setError(error.message || 'Error desconocido al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const url = '/api/productos';
      const method = editingProducto ? 'PUT' : 'POST';
      const body = editingProducto ? { ...formData, _id: editingProducto._id } : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        cargarProductos();
        setShowModal(false);
        resetForm();
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error al guardar producto:', error);
      alert('Error al guardar producto');
    }
  };

  const handleEdit = (producto: Producto) => {
    setEditingProducto(producto);
    setFormData(producto);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    try {
      const res = await fetch('/api/productos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: id }),
      });

      if (res.ok) {
        cargarProductos();
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      alert('Error al eliminar producto');
    }
  };

  const resetForm = () => {
    setFormData({ nombre: '', precio: 0, cantidad: 0, costo: 0, codigoBarras: '' });
    setEditingProducto(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gray-400 mb-6"></div>
          <p className="text-gray-600 text-xl font-bold">Cargando productos de belleza...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-2xl font-bold text-gray-600 mb-2">Error al cargar productos</h3>
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              cargarProductos();
            }}
            className="bg-gradient-to-r from-gray-400 to-gray-500 text-white px-6 py-3 rounded-xl font-bold hover:from-gray-500 hover:to-gray-600 transition-all"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-2 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-gray-500 via-gray-400 to-gray-500 bg-clip-text text-transparent mb-2">
            💄 Inventario de Productos
          </h2>
          <p className="text-gray-600 mt-2 text-sm sm:text-base md:text-lg font-medium">Gestiona tu catálogo de productos de belleza</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-gradient-to-r from-gray-400 via-gray-500 to-gray-400 text-white px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold hover:from-gray-500 hover:via-gray-600 hover:to-gray-500 transition-all duration-300 shadow-2xl hover:shadow-gray-400/50 transform hover:scale-105 sm:hover:scale-110 flex items-center justify-center space-x-2 sm:space-x-3 border-2 border-white/30 backdrop-blur-sm w-full sm:w-auto"
        >
          <span className="text-xl sm:text-2xl">✨</span>
          <span className="text-sm sm:text-base md:text-lg">Nuevo Producto</span>
        </button>
      </div>

      {productos.length === 0 ? (
        <div className="text-center py-12 sm:py-16 md:py-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl sm:rounded-3xl shadow-xl border-2 border-dashed border-gray-300 px-4">
          <div className="text-5xl sm:text-6xl md:text-7xl mb-4 sm:mb-6 animate-pulse">💄</div>
          <p className="text-gray-600 text-xl sm:text-2xl font-bold mb-2 sm:mb-3">No hay productos registrados</p>
          <p className="text-gray-500 text-sm sm:text-base font-medium">Comienza agregando tu primer producto de belleza</p>
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border-2 border-gray-200/50">
          {/* Vista móvil: Cards */}
          <div className="block sm:hidden p-4 space-y-4">
            {productos.map((producto, index) => {
              const ganancia = producto.precio - producto.costo;
              return (
                <div
                  key={producto._id}
                  className="bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 rounded-xl p-4 border-2 border-gray-200"
                >
                  <div className="flex items-center mb-3">
                    <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-gray-400 via-gray-500 to-gray-400 rounded-xl flex items-center justify-center text-white font-bold mr-3 shadow-lg">
                      {producto.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-gray-700 truncate">{producto.nombre}</div>
                      <div className="text-xs text-purple-500 font-medium">
                        {producto.codigoBarras ? `Código: ${producto.codigoBarras}` : `ID: ${producto._id?.slice(-6)}`}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div>
                      <span className="text-gray-500 font-semibold">Precio:</span>
                      <span className="ml-1 text-gray-600 font-bold">${producto.precio.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 font-semibold">Costo:</span>
                      <span className="ml-1 text-gray-600 font-medium">${producto.costo.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 font-semibold">Stock:</span>
                      <span className={`ml-1 inline-flex items-center px-2 py-1 rounded-full text-xs font-bold shadow-md ${
                        producto.cantidad > 10
                          ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-white'
                          : producto.cantidad > 5
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white'
                          : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                      }`}>
                        {producto.cantidad} unidades
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 font-semibold">Ganancia:</span>
                      <span className="ml-1 text-gray-600 font-bold">${ganancia.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => handleEdit(producto)}
                      className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 text-white px-3 py-2 rounded-lg hover:from-gray-500 hover:to-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold text-xs sm:text-sm"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleDelete(producto._id!)}
                      className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 text-white px-3 py-2 rounded-lg hover:from-gray-500 hover:to-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold text-xs sm:text-sm"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Vista desktop: Tabla */}
          <div className="hidden sm:block overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-400 via-gray-500 to-gray-400">
                  <tr>
                    <th className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 text-left text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                      💋 Producto
                    </th>
                    <th className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 text-left text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                      💰 Precio
                    </th>
                    <th className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 text-left text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                      📊 Costo
                    </th>
                    <th className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 text-left text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                      📦 Stock
                    </th>
                    <th className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 text-left text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                      ✨ Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/50 divide-y divide-gray-200">
                  {productos.map((producto, index) => {
                    const ganancia = producto.precio - producto.costo;
                    return (
                      <tr
                        key={producto._id}
                        className="hover:bg-gradient-to-r hover:from-gray-50 hover:via-gray-100 hover:to-gray-50 transition-all duration-300 group"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-gray-400 via-gray-500 to-gray-400 rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-bold mr-3 sm:mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                              {producto.nombre.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm sm:text-base font-bold text-gray-700">{producto.nombre}</div>
                              <div className="text-xs text-purple-500 font-medium">
                                {producto.codigoBarras ? `Código: ${producto.codigoBarras}` : `ID: ${producto._id?.slice(-6)}`}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 whitespace-nowrap">
                          <div className="text-sm sm:text-base font-bold text-gray-600">${producto.precio.toFixed(2)}</div>
                        </td>
                        <td className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 whitespace-nowrap">
                          <div className="text-sm sm:text-base font-medium text-gray-600">${producto.costo.toFixed(2)}</div>
                        </td>
                        <td className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-md ${
                            producto.cantidad > 10
                              ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-white'
                              : producto.cantidad > 5
                              ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white'
                              : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                          }`}>
                            {producto.cantidad} unidades
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 whitespace-nowrap text-xs sm:text-sm font-medium">
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <button
                              onClick={() => handleEdit(producto)}
                              className="bg-gradient-to-r from-gray-400 to-gray-500 text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl hover:from-gray-500 hover:to-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110 font-semibold text-xs sm:text-sm"
                            >
                              ✏️ Editar
                            </button>
                            <button
                              onClick={() => handleDelete(producto._id!)}
                              className="bg-gradient-to-r from-gray-400 to-gray-500 text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl hover:from-gray-500 hover:to-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110 font-semibold text-xs sm:text-sm"
                            >
                              🗑️ Eliminar
                            </button>
                          </div>
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

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4 animate-fadeIn overflow-y-auto">
          <div className="bg-white/95 backdrop-blur-lg rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-md my-2 sm:my-4 transform transition-all animate-slideUp border-2 border-gray-200/50 max-h-[95vh] sm:max-h-[calc(100vh-200px)] overflow-y-auto">
            <div className="bg-gradient-to-r from-gray-400 via-gray-500 to-gray-400 px-4 sm:px-6 py-3 sm:py-4 rounded-t-xl sm:rounded-t-2xl border-b-2 border-gray-300/30 sticky top-0 z-10">
              <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
                <span className="text-2xl sm:text-3xl">{editingProducto ? '✨' : '💄'}</span>
                <span>{editingProducto ? 'Editar Producto' : 'Nuevo Producto'}</span>
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-600 mb-1 sm:mb-2 flex items-center space-x-2">
                  <span>💋</span>
                  <span>Nombre del Producto</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400 transition-all duration-300 text-sm sm:text-base font-medium placeholder-purple-300"
                  placeholder="Ej: Labial Rojo Premium"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-600 mb-1 sm:mb-2 flex items-center space-x-2">
                    <span>💰</span>
                    <span>Precio ($)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-500 transition-all duration-300 text-sm sm:text-base font-medium placeholder-gray-300"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-600 mb-1 sm:mb-2 flex items-center space-x-2">
                    <span>📊</span>
                    <span>Costo ($)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.costo}
                    onChange={(e) => setFormData({ ...formData, costo: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-pink-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400 transition-all duration-300 text-sm sm:text-base font-medium placeholder-pink-300"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-600 mb-1 sm:mb-2 flex items-center space-x-2">
                    <span>📦</span>
                    <span>Cantidad</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.cantidad}
                    onChange={(e) => setFormData({ ...formData, cantidad: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400 transition-all duration-300 text-sm sm:text-base font-medium placeholder-purple-300"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-600 mb-1 sm:mb-2 flex items-center space-x-2">
                    <span>📊</span>
                    <span>Código Barras</span>
                  </label>
                  <input
                    type="text"
                    value={formData.codigoBarras || ''}
                    onChange={(e) => setFormData({ ...formData, codigoBarras: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
                        if (submitButton) {
                          submitButton.focus();
                        }
                      }
                    }}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400 transition-all duration-300 text-sm sm:text-base font-medium placeholder-purple-300"
                    placeholder="Opcional"
                  />
                </div>
              </div>
              {formData.precio > 0 && formData.costo > 0 && (
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-300 rounded-lg sm:rounded-xl p-2 sm:p-3 shadow-lg">
                  <p className="text-xs sm:text-sm text-green-800 font-bold">
                    <span className="flex flex-wrap items-center gap-1 sm:gap-2">
                      <span>✨</span>
                      <span>Ganancia: ${(formData.precio - formData.costo).toFixed(2)} | Rentabilidad: {formData.precio > 0 ? (((formData.precio - formData.costo) / formData.precio) * 100).toFixed(1) : '0'}%</span>
                    </span>
                  </p>
                </div>
              )}
              <div className="flex flex-col sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t-2 border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-5 sm:px-6 py-2 sm:py-2.5 border-2 border-gray-300 rounded-lg sm:rounded-xl text-gray-600 font-bold hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-xs sm:text-sm w-full sm:w-auto"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-gray-400 via-gray-500 to-gray-400 text-white rounded-lg sm:rounded-xl font-bold hover:from-gray-500 hover:via-gray-600 hover:to-gray-500 transition-all duration-300 shadow-2xl hover:shadow-gray-400/50 transform hover:scale-105 sm:hover:scale-110 flex items-center justify-center space-x-2 text-xs sm:text-sm w-full sm:w-auto"
                >
                  <span>{editingProducto ? '💾' : '✨'}</span>
                  <span>{editingProducto ? 'Actualizar' : 'Crear'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

