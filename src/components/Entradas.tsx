import { useState, useEffect, type FormEvent } from 'react';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

interface Producto {
  _id: string;
  nombre: string;
  precio: number;
  costo: number;
}

interface ItemEntrada {
  producto: string;
  cantidad: number;
  costo: number;
}

interface Entrada {
  _id: string;
  productos: Array<{
    producto: Producto;
    cantidad: number;
    costo: number;
  }>;
  fecha: string;
}

export default function Entradas() {
  const [entradas, setEntradas] = useState<Entrada[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [items, setItems] = useState<ItemEntrada[]>([]);
  const [sugerencias, setSugerencias] = useState<{ [key: number]: Producto[] }>({});
  const [mostrarSugerencias, setMostrarSugerencias] = useState<{ [key: number]: boolean }>({});
  const [busqueda, setBusqueda] = useState<{ [key: number]: string }>({});
  const fechaActual = new Date().toISOString().split('T')[0];

  useEffect(() => {
    cargarDatos();
  }, []);

  // Inicializar con un renglón vacío cuando se abre el modal
  useEffect(() => {
    if (showModal) {
      if (items.length === 0) {
        setItems([{ producto: '', cantidad: 1, costo: 0 }]);
        setBusqueda({ 0: '' });
      }
      // Enfocar el primer campo del primer renglón cuando se abre el modal
      setTimeout(() => {
        const firstInput = document.querySelector('[data-row="0"][data-field="producto"]') as HTMLInputElement;
        firstInput?.focus();
      }, 100);
    }
  }, [showModal]);

  // Atajos de teclado para Entradas
  useKeyboardShortcuts([
    {
      key: 'n',
      handler: () => {
        if (!showModal) {
          setShowModal(true);
        }
      },
      description: 'Nueva entrada',
    },
    {
      key: 'Escape',
      handler: () => {
        if (showModal) {
          setShowModal(false);
          setItems([]);
        }
      },
      description: 'Cerrar modal',
    },
  ], !loading);

  const cargarDatos = async () => {
    try {
      const [entradasRes, productosRes] = await Promise.all([
        fetch('/api/entradas'),
        fetch('/api/productos'),
      ]);
      const entradasData = await entradasRes.json();
      const productosData = await productosRes.json();
      setEntradas(entradasData);
      setProductos(productosData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      alert('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const buscarProductos = (texto: string, rowIndex: number) => {
    if (!texto || texto.trim() === '') {
      setSugerencias(prev => ({ ...prev, [rowIndex]: [] }));
      setMostrarSugerencias(prev => ({ ...prev, [rowIndex]: false }));
      return;
    }

    const textoBusqueda = texto.toLowerCase().trim();
    const productosFiltrados = productos.filter(p => 
      p.nombre.toLowerCase().includes(textoBusqueda)
    ).slice(0, 5); // Máximo 5 sugerencias

    setSugerencias(prev => ({ ...prev, [rowIndex]: productosFiltrados }));
    setMostrarSugerencias(prev => ({ ...prev, [rowIndex]: productosFiltrados.length > 0 }));
    setBusqueda(prev => ({ ...prev, [rowIndex]: texto }));
  };

  const seleccionarProducto = (rowIndex: number, producto: Producto) => {
    const nuevosItems = [...items];
    nuevosItems[rowIndex] = { 
      ...nuevosItems[rowIndex], 
      producto: producto._id,
      costo: producto.costo || 0
    };
    setItems(nuevosItems);
    setBusqueda(prev => ({ ...prev, [rowIndex]: producto.nombre }));
    setSugerencias(prev => ({ ...prev, [rowIndex]: [] }));
    setMostrarSugerencias(prev => ({ ...prev, [rowIndex]: false }));

    // Si todos los campos del renglón están completos y es el último renglón, agregar uno nuevo
    const itemActualizado = nuevosItems[rowIndex];
    const estaCompleto = itemActualizado.producto && itemActualizado.cantidad > 0 && itemActualizado.costo >= 0;
    const esUltimoRenglon = rowIndex === nuevosItems.length - 1;
    
    if (estaCompleto && esUltimoRenglon) {
      if (!nuevosItems[rowIndex + 1]) {
        nuevosItems.push({ producto: '', cantidad: 1, costo: 0 });
        setItems(nuevosItems);
        // Enfocar el siguiente campo después de un breve delay
        setTimeout(() => {
          const nextInput = document.querySelector(`[data-row="${rowIndex}"][data-field="cantidad"]`) as HTMLInputElement;
          nextInput?.focus();
        }, 100);
      }
    } else {
      // Si no está completo, enfocar el siguiente campo
      setTimeout(() => {
        const nextInput = document.querySelector(`[data-row="${rowIndex}"][data-field="cantidad"]`) as HTMLInputElement;
        nextInput?.focus();
      }, 100);
    }
  };

  const actualizarItem = (index: number, campo: keyof ItemEntrada, valor: any) => {
    const nuevosItems = [...items];
    nuevosItems[index] = { ...nuevosItems[index], [campo]: valor };
    
    // Si todos los campos del renglón están completos y es el último renglón, agregar uno nuevo
    const itemActualizado = nuevosItems[index];
    const estaCompleto = itemActualizado.producto && itemActualizado.cantidad > 0 && itemActualizado.costo >= 0;
    const esUltimoRenglon = index === nuevosItems.length - 1;
    
    if (estaCompleto && esUltimoRenglon && campo === 'costo') {
      // Agregar un nuevo renglón vacío solo si el último está completo y aún no existe otro
      if (!nuevosItems[index + 1]) {
        nuevosItems.push({ producto: '', cantidad: 1, costo: 0 });
      }
    }
    
    setItems(nuevosItems);
  };

  const eliminarItem = (index: number) => {
    const nuevosItems = items.filter((_, i) => i !== index);
    // Si se elimina el último renglón y no quedan renglones, agregar uno vacío
    setItems(nuevosItems.length === 0 ? [{ producto: '', cantidad: 1, costo: 0 }] : nuevosItems);
  };

  // Manejar navegación con teclado
  const handleKeyDown = (e: React.KeyboardEvent, rowIndex: number, field: 'producto' | 'cantidad' | 'costo') => {
    if (field === 'producto') {
      if (e.key === 'Tab' || e.key === 'Enter') {
        // Si hay sugerencias, seleccionar la primera
        if (sugerencias[rowIndex] && sugerencias[rowIndex].length > 0) {
          e.preventDefault();
          seleccionarProducto(rowIndex, sugerencias[rowIndex][0]);
        } else if (e.key === 'Tab' && items[rowIndex].producto) {
          // Si ya hay un producto seleccionado, ir al siguiente campo
          const nextInput = document.querySelector(`[data-row="${rowIndex}"][data-field="cantidad"]`) as HTMLInputElement;
          nextInput?.focus();
        }
      } else if (e.key === 'ArrowDown' && sugerencias[rowIndex] && sugerencias[rowIndex].length > 0) {
        e.preventDefault();
        // Enfocar la primera sugerencia
        const firstSuggestion = document.querySelector(`[data-suggestion-row="${rowIndex}"][data-suggestion-index="0"]`) as HTMLElement;
        firstSuggestion?.focus();
      } else if (e.key === 'Escape') {
        setMostrarSugerencias(prev => ({ ...prev, [rowIndex]: false }));
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      // Navegar al siguiente campo o al siguiente renglón
      if (field === 'cantidad') {
        const nextInput = document.querySelector(`[data-row="${rowIndex}"][data-field="costo"]`) as HTMLInputElement;
        nextInput?.focus();
      } else if (field === 'costo') {
        // Si hay un siguiente renglón, ir al primer campo de ese renglón
        setTimeout(() => {
          const nextRowInput = document.querySelector(`[data-row="${rowIndex + 1}"][data-field="producto"]`) as HTMLInputElement;
          if (nextRowInput) {
            nextRowInput.focus();
          }
        }, 150);
      }
    } else if (e.key === 'ArrowDown' && (field === 'cantidad' || field === 'costo')) {
      e.preventDefault();
      // Ir al mismo campo del siguiente renglón
      const nextRowInput = document.querySelector(`[data-row="${rowIndex + 1}"][data-field="${field}"]`) as HTMLInputElement;
      if (nextRowInput) {
        nextRowInput.focus();
      }
    } else if (e.key === 'ArrowUp' && (field === 'cantidad' || field === 'costo')) {
      e.preventDefault();
      // Ir al mismo campo del renglón anterior
      if (rowIndex > 0) {
        const prevRowInput = document.querySelector(`[data-row="${rowIndex - 1}"][data-field="${field}"]`) as HTMLInputElement;
        prevRowInput?.focus();
      }
    } else if (e.key === 'Tab' && field === 'costo' && rowIndex === items.length - 1) {
      // Si Tab en el último campo del último renglón y está completo, agregar renglón
      const itemActual = items[rowIndex];
      if (itemActual.producto && itemActual.cantidad > 0 && itemActual.costo >= 0) {
        e.preventDefault();
        actualizarItem(rowIndex, 'costo', itemActual.costo);
        setTimeout(() => {
          const newRowInput = document.querySelector(`[data-row="${rowIndex + 1}"][data-field="producto"]`) as HTMLInputElement;
          newRowInput?.focus();
        }, 150);
      }
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const productosValidos = items.filter(item => item.producto && item.cantidad > 0 && item.costo >= 0);
    if (productosValidos.length === 0) {
      alert('Debes agregar al menos un producto con todos los campos completos');
      return;
    }

    try {
      const res = await fetch('/api/entradas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productos: items.filter(item => item.producto && item.cantidad > 0 && item.costo >= 0),
            fecha: new Date(fechaActual),
          }),
      });

      if (res.ok) {
        cargarDatos();
        setItems([]);
        setBusqueda({});
        setSugerencias({});
        setMostrarSugerencias({});
        setShowModal(false);
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error al crear entrada:', error);
      alert('Error al crear entrada');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600 mb-6"></div>
          <p className="text-purple-700 text-xl font-bold">Cargando entradas de belleza...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-5xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-fuchsia-600 bg-clip-text text-transparent mb-2">
            📥 Entradas de Productos
          </h2>
          <p className="text-purple-700 mt-2 text-lg font-medium">Registra el ingreso de productos de belleza al inventario</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-purple-600 via-pink-500 to-fuchsia-600 text-white px-8 py-4 rounded-2xl font-bold hover:from-purple-700 hover:via-pink-600 hover:to-fuchsia-700 transition-all duration-300 shadow-2xl hover:shadow-purple-500/50 transform hover:scale-110 flex items-center space-x-3 border-2 border-white/30 backdrop-blur-sm"
        >
          <span className="text-2xl">✨</span>
          <span className="text-lg">Nueva Entrada</span>
        </button>
      </div>

      {entradas.length === 0 ? (
        <div className="text-center py-24 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl shadow-xl border-2 border-dashed border-purple-300">
          <div className="text-7xl mb-6 animate-pulse">📥</div>
          <p className="text-purple-700 text-2xl font-bold mb-3">No hay entradas registradas</p>
          <p className="text-pink-600 text-base font-medium">Comienza registrando tu primera entrada de productos</p>
        </div>
      ) : (
        <div className="space-y-6">
          {entradas.map((entrada) => {
            const totalEntrada = entrada.productos.reduce((sum, item) => sum + (item.cantidad * item.costo), 0);
            return (
              <div key={entrada._id} className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border-2 border-purple-200/50 hover:shadow-purple-500/30 transition-all duration-300 transform hover:scale-[1.02]">
                <div className="flex justify-between items-center mb-8 pb-6 border-b-2 border-purple-100">
                  <div>
                    <h3 className="text-2xl font-bold text-purple-900 flex items-center space-x-3">
                      <span className="text-3xl">📅</span>
                      <span>{new Date(entrada.fecha).toLocaleDateString('es-ES', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </h3>
                    <p className="text-sm text-purple-600 mt-2 font-semibold">
                      {entrada.productos.length} producto{entrada.productos.length > 1 ? 's' : ''} de belleza
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-fuchsia-500 text-white px-6 py-3 rounded-2xl font-bold text-xl shadow-xl">
                    Total: ${totalEntrada.toFixed(2)}
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
                          💰 Costo Unitario
                        </th>
                        <th className="px-8 py-5 text-left text-sm font-bold text-white uppercase tracking-wider">
                          ✨ Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white/50 divide-y divide-purple-100">
                      {entrada.productos.map((item, idx) => (
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
                            ${item.costo.toFixed(2)}
                          </td>
                          <td className="px-8 py-5 whitespace-nowrap text-base font-bold text-green-600">
                            ${(item.cantidad * item.costo).toFixed(2)}
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
                <span className="text-4xl">📥</span>
                <span>Nueva Entrada de Productos</span>
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-base font-bold text-purple-800 mb-3 flex items-center space-x-2">
                  <span>📅</span>
                  <span>Fecha de Entrada</span>
                </label>
                <div className="w-full px-5 py-4 bg-purple-50 border-2 border-purple-200 rounded-2xl text-lg font-medium text-purple-700">
                  {new Date(fechaActual).toLocaleDateString('es-ES', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>

              <div>
                <label className="block text-base font-bold text-purple-800 mb-4 flex items-center space-x-2">
                  <span>📦</span>
                  <span>Productos</span>
                </label>

                <div className="space-y-3">
                  {/* Encabezado de la tabla */}
                  <div className="grid grid-cols-12 gap-3 px-4 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-fuchsia-500 rounded-xl text-white font-bold text-sm">
                    <div className="col-span-5">💋 Producto</div>
                    <div className="col-span-2">📦 Cantidad</div>
                    <div className="col-span-2">💰 Costo</div>
                    <div className="col-span-2">✨ Subtotal</div>
                    <div className="col-span-1 text-center">🗑️</div>
                  </div>

                  {/* Renglones de productos */}
                  {items.map((item, index) => (
                    <div 
                      key={index} 
                      className="grid grid-cols-12 gap-3 p-4 bg-gradient-to-r from-purple-50 via-pink-50 to-fuchsia-50 border-2 border-purple-200 rounded-xl hover:shadow-lg transition-all duration-300"
                    >
                      <div className="col-span-5 relative">
                        <input
                          type="text"
                          required={index === 0 || items.filter(i => i.producto).length > 0}
                          value={busqueda[index] || (item.producto ? productos.find(p => p._id === item.producto)?.nombre || '' : '')}
                          onChange={(e) => {
                            const texto = e.target.value;
                            buscarProductos(texto, index);
                            // Si el texto está vacío, limpiar el producto seleccionado y el costo
                            if (!texto || texto.trim() === '') {
                              const nuevosItems = [...items];
                              nuevosItems[index] = { 
                                ...nuevosItems[index], 
                                producto: '',
                                costo: 0
                              };
                              setItems(nuevosItems);
                            }
                          }}
                          onKeyDown={(e) => handleKeyDown(e, index, 'producto')}
                          onFocus={() => {
                            if (busqueda[index] || item.producto) {
                              buscarProductos(busqueda[index] || productos.find(p => p._id === item.producto)?.nombre || '', index);
                            }
                          }}
                          onBlur={() => {
                            // Cerrar sugerencias después de un pequeño delay para permitir clicks
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
                                data-suggestion-row={index}
                                data-suggestion-index={idx}
                                onClick={() => seleccionarProducto(index, producto)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    seleccionarProducto(index, producto);
                                  } else if (e.key === 'ArrowDown') {
                                    e.preventDefault();
                                    const next = document.querySelector(`[data-suggestion-row="${index}"][data-suggestion-index="${idx + 1}"]`) as HTMLElement;
                                    if (next) {
                                      next.focus();
                                    }
                                  } else if (e.key === 'ArrowUp') {
                                    e.preventDefault();
                                    if (idx > 0) {
                                      const prev = document.querySelector(`[data-suggestion-row="${index}"][data-suggestion-index="${idx - 1}"]`) as HTMLElement;
                                      if (prev) {
                                        prev.focus();
                                      } else {
                                        const input = document.querySelector(`[data-row="${index}"][data-field="producto"]`) as HTMLInputElement;
                                        input?.focus();
                                      }
                                    }
                                  } else if (e.key === 'Tab') {
                                    seleccionarProducto(index, producto);
                                  }
                                }}
                                tabIndex={0}
                                className="px-4 py-3 hover:bg-gradient-to-r hover:from-purple-50 hover:via-pink-50 hover:to-fuchsia-50 cursor-pointer transition-all duration-200 border-b border-purple-100 last:border-b-0 focus:outline-none focus:bg-gradient-to-r focus:from-purple-100 focus:via-pink-100 focus:to-fuchsia-100"
                              >
                                <div className="font-bold text-purple-900">{producto.nombre}</div>
                                {producto.costo > 0 && (
                                  <div className="text-sm text-purple-600 mt-1">Costo: ${producto.costo.toFixed(2)}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min="1"
                          required={index === 0 || item.producto !== ''}
                          value={item.cantidad}
                          onChange={(e) =>
                            actualizarItem(index, 'cantidad', parseInt(e.target.value) || 1)
                          }
                          onKeyDown={(e) => handleKeyDown(e, index, 'cantidad')}
                          data-row={index}
                          data-field="cantidad"
                          className="w-full px-4 py-2.5 text-base border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all duration-300 font-medium bg-white"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          required={index === 0 || item.producto !== ''}
                          value={item.costo}
                          onChange={(e) =>
                            actualizarItem(index, 'costo', parseFloat(e.target.value) || 0)
                          }
                          onKeyDown={(e) => handleKeyDown(e, index, 'costo')}
                          data-row={index}
                          data-field="costo"
                          className="w-full px-4 py-2.5 text-base border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all duration-300 font-medium bg-white"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="col-span-2 flex items-center">
                        <span className="text-base font-bold text-green-600">
                          ${(item.cantidad * item.costo).toFixed(2)}
                        </span>
                      </div>
                      <div className="col-span-1 flex items-center justify-center">
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => eliminarItem(index)}
                            className="text-red-500 hover:text-red-700 transition-colors duration-200 text-xl font-bold"
                            title="Eliminar renglón"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {items.filter(item => item.producto && item.cantidad > 0 && item.costo >= 0).length > 0 && (
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 rounded-2xl p-5 mb-4 shadow-lg">
                  <p className="text-base font-bold text-purple-900">
                    💎 Total de la Entrada: ${items
                      .filter(item => item.producto && item.cantidad > 0 && item.costo >= 0)
                      .reduce((sum, item) => sum + item.cantidad * item.costo, 0)
                      .toFixed(2)}
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
                  disabled={items.filter(item => item.producto && item.cantidad > 0 && item.costo >= 0).length === 0}
                  className={`px-8 py-4 rounded-2xl font-bold transition-all duration-300 shadow-2xl hover:shadow-purple-500/50 transform hover:scale-110 flex items-center space-x-2 ${
                    items.filter(item => item.producto && item.cantidad > 0 && item.costo >= 0).length === 0
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 via-pink-500 to-fuchsia-600 text-white hover:from-purple-700 hover:via-pink-600 hover:to-fuchsia-700'
                  }`}
                >
                  <span>✨</span>
                  <span>Registrar Entrada</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

