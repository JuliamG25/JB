import { useState, useEffect, type FormEvent } from 'react';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

interface Producto {
  _id: string;
  nombre: string;
  precio: number;
  costo: number;
  cantidad: number;
}

interface ItemSalida {
  producto: string;
  cantidad: number;
  precio: number;
}

interface Salida {
  _id: string;
  productos: Array<{
    producto: Producto;
    cantidad: number;
    precio: number;
  }>;
  fecha: string;
}

export default function Salidas() {
  const [salidas, setSalidas] = useState<Salida[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [items, setItems] = useState<ItemSalida[]>([]);
  const [sugerencias, setSugerencias] = useState<{ [key: number]: Producto[] }>({});
  const [mostrarSugerencias, setMostrarSugerencias] = useState<{ [key: number]: boolean }>({});
  const [busqueda, setBusqueda] = useState<{ [key: number]: string }>({});
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    cargarDatos();
  }, []);

  // Atajos de teclado para Salidas
  useKeyboardShortcuts([
    {
      key: 'n',
      handler: () => {
        if (!showModal) {
          setShowModal(true);
        }
      },
      description: 'Nueva venta',
    },
    {
      key: 'Escape',
      handler: () => {
        if (showModal) {
          setShowModal(false);
          setItems([]);
          setBusqueda({});
          setSugerencias({});
          setMostrarSugerencias({});
        }
      },
      description: 'Cerrar modal',
    },
  ], !loading);

  const cargarDatos = async () => {
    try {
      const [salidasRes, productosRes] = await Promise.all([
        fetch('/api/salidas'),
        fetch('/api/productos'),
      ]);
      
      if (!salidasRes.ok) {
        const errorData = await salidasRes.json().catch(() => ({ error: `Error ${salidasRes.status}` }));
        throw new Error(errorData.error || `Error al cargar salidas: ${salidasRes.status}`);
      }
      
      if (!productosRes.ok) {
        const errorData = await productosRes.json().catch(() => ({ error: `Error ${productosRes.status}` }));
        throw new Error(errorData.error || `Error al cargar productos: ${productosRes.status}`);
      }
      
      const salidasData = await salidasRes.json();
      const productosData = await productosRes.json();
      
      // Verificar si hay errores en las respuestas
      if (salidasData.error) {
        throw new Error(salidasData.error);
      }
      if (productosData.error) {
        throw new Error(productosData.error);
      }
      
      setSalidas(Array.isArray(salidasData) ? salidasData : []);
      setProductos(Array.isArray(productosData) ? productosData : []);
      setError(null);
    } catch (error: any) {
      console.error('Error al cargar datos:', error);
      setSalidas([]);
      setProductos([]);
      setError(error.message || 'Error desconocido al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  // Inicializar con un renglón vacío cuando se abre el modal
  useEffect(() => {
    if (showModal) {
      if (items.length === 0) {
        setItems([{ producto: '', cantidad: 1, precio: 0 }]);
        setBusqueda({ 0: '' });
      }
      // Enfocar el primer campo del primer renglón cuando se abre el modal
      setTimeout(() => {
        const firstInput = document.querySelector('[data-row="0"][data-field="producto"]') as HTMLInputElement;
        firstInput?.focus();
      }, 100);
    }
  }, [showModal]);

  const buscarProductos = (texto: string, rowIndex: number) => {
    if (!texto || texto.trim() === '') {
      setSugerencias(prev => ({ ...prev, [rowIndex]: [] }));
      setMostrarSugerencias(prev => ({ ...prev, [rowIndex]: false }));
      return;
    }

    const textoBusqueda = texto.toLowerCase().trim();
    // Filtrar solo productos con stock disponible
    const productosFiltrados = productos
      .filter(p => p.cantidad > 0 && p.nombre.toLowerCase().includes(textoBusqueda))
      .slice(0, 5); // Máximo 5 sugerencias

    setSugerencias(prev => ({ ...prev, [rowIndex]: productosFiltrados }));
    setMostrarSugerencias(prev => ({ ...prev, [rowIndex]: productosFiltrados.length > 0 }));
    setBusqueda(prev => ({ ...prev, [rowIndex]: texto }));
  };

  const seleccionarProducto = (rowIndex: number, producto: Producto) => {
    const nuevosItems = [...items];
    nuevosItems[rowIndex] = { 
      ...nuevosItems[rowIndex], 
      producto: producto._id,
      precio: producto.precio || 0
    };
    setItems(nuevosItems);
    setBusqueda(prev => ({ ...prev, [rowIndex]: producto.nombre }));
    setSugerencias(prev => ({ ...prev, [rowIndex]: [] }));
    setMostrarSugerencias(prev => ({ ...prev, [rowIndex]: false }));
    
    // Enfocar el siguiente campo (cantidad)
    setTimeout(() => {
      const nextInput = document.querySelector(`[data-row="${rowIndex}"][data-field="cantidad"]`) as HTMLInputElement;
      nextInput?.focus();
    }, 100);
  };

  const agregarItem = () => {
    const nuevoIndex = items.length;
    setItems([...items, { producto: '', cantidad: 1, precio: 0 }]);
    setBusqueda(prev => ({ ...prev, [nuevoIndex]: '' }));
    // Enfocar el nuevo campo de producto
    setTimeout(() => {
      const newInput = document.querySelector(`[data-row="${nuevoIndex}"][data-field="producto"]`) as HTMLInputElement;
      newInput?.focus();
    }, 100);
  };

  const actualizarItem = (index: number, campo: keyof ItemSalida, valor: any) => {
    const nuevosItems = [...items];
    nuevosItems[index] = { ...nuevosItems[index], [campo]: valor };
    setItems(nuevosItems);
  };

  const eliminarItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (items.length === 0) {
      alert('Debes agregar al menos un producto');
      return;
    }

    try {
      const res = await fetch('/api/salidas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productos: items,
          fecha: new Date(fecha),
        }),
      });

      if (res.ok) {
        cargarDatos();
        setShowModal(false);
        setItems([]);
        setBusqueda({});
        setSugerencias({});
        setMostrarSugerencias({});
        setFecha(new Date().toISOString().split('T')[0]);
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error al crear salida:', error);
      alert('Error al crear salida');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Cargando salidas...</p>
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
              cargarDatos();
            }}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            📤 Salidas / Ventas
          </h2>
          <p className="text-gray-600 mt-2">Registra las ventas y salidas de productos</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
        >
          <span className="text-xl">+</span>
          <span>Nueva Salida</span>
        </button>
      </div>

      {salidas.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-lg border-2 border-dashed border-gray-300">
          <div className="text-6xl mb-4">📤</div>
          <p className="text-gray-600 text-xl font-medium mb-2">No hay salidas registradas</p>
          <p className="text-gray-400 text-sm">Comienza registrando tu primera venta</p>
        </div>
      ) : (
        <div className="space-y-6">
          {salidas.map((salida) => {
            const totalSalida = salida.productos.reduce((sum, item) => sum + (item.cantidad * item.precio), 0);
            return (
              <div key={salida._id} className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border-2 border-purple-200/50 hover:shadow-purple-500/30 transition-all duration-300 transform hover:scale-[1.02]">
                <div className="flex justify-between items-center mb-8 pb-6 border-b-2 border-purple-100">
                  <div>
                    <h3 className="text-2xl font-bold text-purple-900 flex items-center space-x-3">
                      <span className="text-3xl">📅</span>
                      <span>{new Date(salida.fecha).toLocaleDateString('es-ES', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </h3>
                    <p className="text-sm text-purple-600 mt-2 font-semibold">
                      {salida.productos.length} producto{salida.productos.length > 1 ? 's' : ''} vendido{salida.productos.length > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-fuchsia-500 text-white px-6 py-3 rounded-2xl font-bold text-xl shadow-xl">
                    Total: ${totalSalida.toFixed(2)}
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-purple-100">
                    <thead className="bg-gradient-to-r from-purple-500 via-pink-500 to-fuchsia-500">
                      <tr>
                        <th className="px-8 py-5 text-left text-sm font-bold text-white uppercase tracking-wider">
                          💋 Producto
                        </th>
                        <th className="px-8 py-5 text-left text-sm font-bold text-white uppercase tracking-wider">
                          📦 Cantidad
                        </th>
                        <th className="px-8 py-5 text-left text-sm font-bold text-white uppercase tracking-wider">
                          💰 Precio Unitario
                        </th>
                        <th className="px-8 py-5 text-left text-sm font-bold text-white uppercase tracking-wider">
                          ✨ Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white/50 divide-y divide-purple-100">
                      {salida.productos.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gradient-to-r hover:from-purple-50 hover:via-pink-50 hover:to-fuchsia-50 transition-all duration-300">
                          <td className="px-8 py-5 whitespace-nowrap">
                            <div className="text-base font-bold text-purple-900">
                              {typeof item.producto === 'object' ? item.producto.nombre : 'N/A'}
                            </div>
                          </td>
                          <td className="px-8 py-5 whitespace-nowrap">
                            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-white shadow-md">
                              {item.cantidad} unidades
                            </span>
                          </td>
                          <td className="px-8 py-5 whitespace-nowrap text-base font-semibold text-purple-700">
                            ${item.precio.toFixed(2)}
                          </td>
                          <td className="px-8 py-5 whitespace-nowrap text-base font-bold text-green-600">
                            ${(item.cantidad * item.precio).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-all border-2 border-purple-200/50">
            <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-fuchsia-600 px-8 py-6 rounded-t-3xl sticky top-0 z-10 border-b-2 border-purple-400/30">
              <h3 className="text-3xl font-bold text-white flex items-center space-x-3">
                <span className="text-4xl">📤</span>
                <span>Nueva Venta / Salida</span>
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              <div>
                <label className="block text-base font-bold text-purple-800 mb-3 flex items-center space-x-2">
                  <span>📅</span>
                  <span>Fecha de Venta</span>
                </label>
                <input
                  type="date"
                  required
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full px-5 py-4 border-2 border-purple-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all duration-300 text-lg font-medium"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-base font-bold text-purple-800 flex items-center space-x-2">
                    <span>💋</span>
                    <span>Productos Vendidos</span>
                  </label>
                  <button
                    type="button"
                    onClick={agregarItem}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110 font-bold flex items-center space-x-2"
                  >
                    <span className="text-xl">✨</span>
                    <span>Agregar Producto</span>
                  </button>
                </div>

                {items.length === 0 && (
                  <div className="text-center py-12 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-dashed border-purple-300">
                    <p className="text-purple-700 text-base font-bold">No hay productos agregados</p>
                    <p className="text-pink-600 text-sm mt-2 font-medium">Haz clic en "Agregar Producto" para comenzar</p>
                  </div>
                )}

                <div className="space-y-3">
                  {/* Encabezado de la tabla */}
                  {items.length > 0 && (
                    <div className="grid grid-cols-12 gap-3 px-4 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-fuchsia-500 rounded-xl text-white font-bold text-sm">
                      <div className="col-span-4">💋 Producto</div>
                      <div className="col-span-2">📦 Cantidad</div>
                      <div className="col-span-2">💰 Precio</div>
                      <div className="col-span-2">✨ Subtotal</div>
                      <div className="col-span-2 text-center">🗑️</div>
                    </div>
                  )}

                  {/* Renglones de productos */}
                  {items.map((item, index) => {
                    const productoSeleccionado = productos.find((p) => p._id === item.producto);
                    const stockDisponible = productoSeleccionado?.cantidad || 0;

                    return (
                      <div 
                        key={index} 
                        className="grid grid-cols-12 gap-3 p-4 bg-gradient-to-r from-purple-50 via-pink-50 to-fuchsia-50 border-2 border-purple-200 rounded-xl hover:shadow-lg transition-all duration-300"
                      >
                        <div className="col-span-4 relative">
                          <input
                            type="text"
                            required
                            value={busqueda[index] || (item.producto ? productos.find(p => p._id === item.producto)?.nombre || '' : '')}
                            onChange={(e) => {
                              const texto = e.target.value;
                              buscarProductos(texto, index);
                              // Si el texto está vacío, limpiar el producto seleccionado
                              if (!texto || texto.trim() === '') {
                                const nuevosItems = [...items];
                                nuevosItems[index] = { 
                                  ...nuevosItems[index], 
                                  producto: '',
                                  precio: 0
                                };
                                setItems(nuevosItems);
                              }
                            }}
                            onFocus={() => {
                              if (busqueda[index] || item.producto) {
                                buscarProductos(busqueda[index] || productos.find(p => p._id === item.producto)?.nombre || '', index);
                              }
                            }}
                            onBlur={() => {
                              setTimeout(() => {
                                setMostrarSugerencias(prev => ({ ...prev, [index]: false }));
                              }, 200);
                            }}
                            data-row={index}
                            data-field="producto"
                            className="w-full px-4 py-2.5 text-base border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all duration-300 font-medium bg-white"
                            placeholder="Buscar producto..."
                            autoComplete="off"
                          />
                          
                          {/* Sugerencias */}
                          {mostrarSugerencias[index] && sugerencias[index] && sugerencias[index].length > 0 && (
                            <div className="absolute z-50 w-full mt-1 bg-white border-2 border-purple-200 rounded-lg shadow-2xl max-h-60 overflow-y-auto">
                              {sugerencias[index].map((producto, idx) => (
                                <div
                                  key={producto._id}
                                  onClick={() => seleccionarProducto(index, producto)}
                                  className="px-4 py-3 hover:bg-gradient-to-r hover:from-purple-50 hover:via-pink-50 hover:to-fuchsia-50 cursor-pointer transition-all duration-200 border-b border-purple-100 last:border-b-0"
                                >
                                  <div className="font-bold text-purple-900">{producto.nombre}</div>
                                  <div className="text-sm text-purple-600 mt-1">
                                    Stock: {producto.cantidad} | Precio: ${producto.precio.toFixed(2)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            min="1"
                            max={stockDisponible}
                            required
                            value={item.cantidad}
                            onChange={(e) =>
                              actualizarItem(index, 'cantidad', parseInt(e.target.value) || 1)
                            }
                            data-row={index}
                            data-field="cantidad"
                            className="w-full px-4 py-2.5 text-base border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all duration-300 font-medium bg-white"
                            placeholder="Cantidad"
                            title={`Máximo: ${stockDisponible}`}
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            required
                            value={item.precio}
                            onChange={(e) =>
                              actualizarItem(index, 'precio', parseFloat(e.target.value) || 0)
                            }
                            data-row={index}
                            data-field="precio"
                            className="w-full px-4 py-2.5 text-base border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all duration-300 font-medium bg-white"
                            placeholder="0.00"
                          />
                        </div>
                        <div className="col-span-2 flex items-center">
                          <span className="text-base font-bold text-green-600">
                            ${(item.cantidad * item.precio).toFixed(2)}
                          </span>
                        </div>
                        <div className="col-span-2 flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => eliminarItem(index)}
                            className="text-red-500 hover:text-red-700 transition-colors duration-200 text-xl font-bold"
                            title="Eliminar renglón"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {items.length > 0 && (
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 rounded-2xl p-5 mb-4 shadow-lg">
                  <p className="text-base font-bold text-purple-900">
                    💎 Total de la Venta: ${items.reduce((sum, item) => sum + item.cantidad * item.precio, 0).toFixed(2)}
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-4 pt-6 border-t-2 border-purple-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setItems([]);
                    setBusqueda({});
                    setSugerencias({});
                    setMostrarSugerencias({});
                  }}
                  className="px-8 py-4 border-2 border-purple-300 rounded-2xl text-purple-700 font-bold hover:bg-purple-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={items.length === 0}
                  className={`px-8 py-4 rounded-2xl font-bold transition-all duration-300 shadow-2xl hover:shadow-purple-500/50 transform hover:scale-110 flex items-center space-x-2 ${
                    items.length === 0
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 via-pink-500 to-fuchsia-600 text-white hover:from-purple-700 hover:via-pink-600 hover:to-fuchsia-700'
                  }`}
                >
                  <span>✨</span>
                  <span>Registrar Venta</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

