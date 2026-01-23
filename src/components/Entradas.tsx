import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

interface Producto {
  _id: string;
  nombre: string;
  precio: number;
  costo: number;
  cantidad: number;
  codigoBarras?: string;
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
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [items, setItems] = useState<ItemEntrada[]>([]);
  const [sugerencias, setSugerencias] = useState<{ [key: number]: Producto[] }>({});
  const [mostrarSugerencias, setMostrarSugerencias] = useState<{ [key: number]: boolean }>({});
  const [busqueda, setBusqueda] = useState<{ [key: number]: string }>({});
  const fechaActual = new Date().toISOString().split('T')[0];

  useEffect(() => {
    cargarDatos();
  }, []);

  // Limpiar timeouts cuando se cierra el modal
  useEffect(() => {
    if (!showModal) {
      // Limpiar todos los timeouts pendientes
      Object.values(seleccionAutomaticaRef.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
      seleccionAutomaticaRef.current = {};
    }
  }, [showModal]);

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
      
      if (!entradasRes.ok) {
        const errorData = await entradasRes.json().catch(() => ({ error: `Error ${entradasRes.status}` }));
        throw new Error(errorData.error || `Error al cargar entradas: ${entradasRes.status}`);
      }
      
      if (!productosRes.ok) {
        const errorData = await productosRes.json().catch(() => ({ error: `Error ${productosRes.status}` }));
        throw new Error(errorData.error || `Error al cargar productos: ${productosRes.status}`);
      }
      
      const entradasData = await entradasRes.json();
      const productosData = await productosRes.json();
      
      // Verificar si hay errores en las respuestas
      if (entradasData.error) {
        throw new Error(entradasData.error);
      }
      if (productosData.error) {
        throw new Error(productosData.error);
      }
      
      setEntradas(Array.isArray(entradasData) ? entradasData : []);
      setProductos(Array.isArray(productosData) ? productosData : []);
      setError(null);
    } catch (error: any) {
      console.error('Error al cargar datos:', error);
      setEntradas([]);
      setProductos([]);
      setError(error.message || 'Error desconocido al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  // Referencia para evitar múltiples selecciones automáticas
  const seleccionAutomaticaRef = useRef<{ [key: number]: NodeJS.Timeout | null }>({});

  const buscarProductos = (texto: string, rowIndex: number) => {
    if (!texto || texto.trim() === '') {
      // Limpiar timeout si existe
      if (seleccionAutomaticaRef.current[rowIndex]) {
        clearTimeout(seleccionAutomaticaRef.current[rowIndex]!);
        seleccionAutomaticaRef.current[rowIndex] = null;
      }
      setSugerencias(prev => ({ ...prev, [rowIndex]: [] }));
      setMostrarSugerencias(prev => ({ ...prev, [rowIndex]: false }));
      setBusqueda(prev => ({ ...prev, [rowIndex]: '' }));
      return;
    }

    const textoBusqueda = texto.trim();
    const textoBusquedaLower = textoBusqueda.toLowerCase();
    
    // Detectar si es un código de barras COMPLETO (solo números, 8-13 dígitos)
    const esCodigoBarrasCompleto = /^\d{8,13}$/.test(textoBusqueda);
    
    let productosFiltrados: Producto[] = [];
    
    if (esCodigoBarrasCompleto) {
      // Limpiar timeout anterior si existe
      if (seleccionAutomaticaRef.current[rowIndex]) {
        clearTimeout(seleccionAutomaticaRef.current[rowIndex]!);
      }
      
      // Buscar coincidencia exacta por código de barras
      const productoExacto = productos.find(p => 
        p.codigoBarras && p.codigoBarras === textoBusqueda
      );
      
      if (productoExacto) {
        productosFiltrados = [productoExacto];
        // Auto-seleccionar solo después de un pequeño delay para asegurar que el código está completo
        seleccionAutomaticaRef.current[rowIndex] = setTimeout(() => {
          // Verificar que el texto actual del input coincida (usar el valor actual del estado)
          const inputElement = document.querySelector(`[data-row="${rowIndex}"][data-field="producto"]`) as HTMLInputElement;
          if (inputElement && inputElement.value.trim() === textoBusqueda) {
            seleccionarProducto(rowIndex, productoExacto);
          }
          seleccionAutomaticaRef.current[rowIndex] = null;
        }, 300);
      } else {
        // No se encontró el código de barras - solo mostrar error si el código está completo
        productosFiltrados = [];
        // Usar un delay para evitar múltiples alerts durante el escaneo
        if (seleccionAutomaticaRef.current[rowIndex]) {
          clearTimeout(seleccionAutomaticaRef.current[rowIndex]!);
        }
        seleccionAutomaticaRef.current[rowIndex] = setTimeout(() => {
          // Verificar que el texto actual del input coincida
          const inputElement = document.querySelector(`[data-row="${rowIndex}"][data-field="producto"]`) as HTMLInputElement;
          if (inputElement && inputElement.value.trim() === textoBusqueda) {
            alert(`⚠️ Producto con código de barras "${textoBusqueda}" no encontrado`);
          }
          seleccionAutomaticaRef.current[rowIndex] = null;
        }, 300);
      }
    } else {
      // Limpiar timeout si existe
      if (seleccionAutomaticaRef.current[rowIndex]) {
        clearTimeout(seleccionAutomaticaRef.current[rowIndex]!);
        seleccionAutomaticaRef.current[rowIndex] = null;
      }
      
      // Búsqueda normal por nombre o código parcial
      productosFiltrados = productos.filter(p => 
        p.nombre.toLowerCase().includes(textoBusquedaLower) ||
        (p.codigoBarras && p.codigoBarras.toLowerCase().includes(textoBusquedaLower))
      ).slice(0, 5);
    }

    setSugerencias(prev => ({ ...prev, [rowIndex]: productosFiltrados }));
    setMostrarSugerencias(prev => ({ ...prev, [rowIndex]: productosFiltrados.length > 0 && !esCodigoBarrasCompleto }));
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

    // Enfocar el siguiente campo (cantidad)
    setTimeout(() => {
      const nextInput = document.querySelector(`[data-row="${rowIndex}"][data-field="cantidad"]`) as HTMLInputElement;
      nextInput?.focus();
    }, 100);
  };

  const actualizarItem = (index: number, campo: keyof ItemEntrada, valor: any) => {
    const nuevosItems = [...items];
    nuevosItems[index] = { ...nuevosItems[index], [campo]: valor };
    
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
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gray-400 mb-6"></div>
          <p className="text-gray-600 text-xl font-bold">Cargando entradas de belleza...</p>
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
              cargarDatos();
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
            📥 Entradas de Productos
          </h2>
          <p className="text-gray-600 mt-2 text-sm sm:text-base md:text-lg font-medium">Registra el ingreso de productos de belleza al inventario</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-gray-400 via-gray-500 to-gray-400 text-white px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold hover:from-gray-500 hover:via-gray-600 hover:to-gray-500 transition-all duration-300 shadow-2xl hover:shadow-gray-400/50 transform hover:scale-105 sm:hover:scale-110 flex items-center justify-center space-x-2 sm:space-x-3 border-2 border-white/30 backdrop-blur-sm w-full sm:w-auto"
        >
          <span className="text-xl sm:text-2xl">✨</span>
          <span className="text-base sm:text-lg">Nueva Entrada</span>
        </button>
      </div>

      {entradas.length === 0 ? (
        <div className="text-center py-12 sm:py-16 md:py-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl sm:rounded-3xl shadow-xl border-2 border-dashed border-gray-300 px-4">
          <div className="text-5xl sm:text-6xl md:text-7xl mb-4 sm:mb-6 animate-pulse">📥</div>
          <p className="text-gray-600 text-xl sm:text-2xl font-bold mb-2 sm:mb-3">No hay entradas registradas</p>
          <p className="text-gray-500 text-sm sm:text-base font-medium">Comienza registrando tu primera entrada de productos</p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {entradas.map((entrada) => {
            const totalEntrada = entrada.productos.reduce((sum, item) => sum + (item.cantidad * item.costo), 0);
            return (
              <div key={entrada._id} className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 border-2 border-gray-200/50 hover:shadow-gray-400/30 transition-all duration-300 transform hover:scale-[1.01] sm:hover:scale-[1.02]">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 md:mb-8 pb-4 sm:pb-6 border-b-2 border-gray-200 gap-3">
                  <div>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-700 flex items-center space-x-2 sm:space-x-3">
                      <span className="text-2xl sm:text-3xl">📅</span>
                      <span className="break-words">{new Date(entrada.fecha).toLocaleDateString('es-ES', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2 font-semibold">
                      {entrada.productos.length} producto{entrada.productos.length > 1 ? 's' : ''} de belleza
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-gray-400 via-gray-500 to-gray-400 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-lg sm:text-xl shadow-xl w-full sm:w-auto text-center">
                    Total: ${totalEntrada.toFixed(2)}
                  </div>
                </div>
                {/* Vista móvil: Cards */}
                <div className="block sm:hidden space-y-3">
                  {entrada.productos.map((item, idx) => (
                    <div key={idx} className="bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 rounded-xl p-4 border-2 border-gray-200">
                      <div className="font-bold text-gray-700 text-base mb-2">
                        {typeof item.producto === 'object' ? item.producto.nombre : 'N/A'}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500 font-semibold">Cantidad:</span>
                          <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-gray-300 to-gray-400 text-white">
                            {item.cantidad} unidades
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 font-semibold">Costo:</span>
                          <span className="ml-2 text-gray-600 font-semibold">${item.costo.toFixed(2)}</span>
                        </div>
                        <div className="col-span-2 pt-2 border-t border-gray-200">
                          <span className="text-gray-500 font-semibold">Total:</span>
                          <span className="ml-2 text-gray-600 font-bold text-base">${(item.cantidad * item.costo).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
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
                            📦 Cantidad
                          </th>
                          <th className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 text-left text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                            💰 Costo Unitario
                          </th>
                          <th className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 text-left text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                            ✨ Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white/50 divide-y divide-gray-200">
                        {entrada.productos.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gradient-to-r hover:from-gray-50 hover:via-gray-100 hover:to-gray-50 transition-all duration-300">
                            <td className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 whitespace-nowrap">
                              <div className="text-sm sm:text-base font-bold text-gray-700">
                                {typeof item.producto === 'object' ? item.producto.nombre : 'N/A'}
                              </div>
                            </td>
                            <td className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 whitespace-nowrap">
                              <span className="inline-flex items-center px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-bold bg-gradient-to-r from-gray-300 to-gray-400 text-white shadow-md">
                                {item.cantidad} unidades
                              </span>
                            </td>
                            <td className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 whitespace-nowrap text-sm sm:text-base font-semibold text-gray-600">
                              ${item.costo.toFixed(2)}
                            </td>
                            <td className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 whitespace-nowrap text-sm sm:text-base font-bold text-gray-600">
                              ${(item.cantidad * item.costo).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto transform transition-all border-2 border-gray-200/50">
            <div className="bg-gradient-to-r from-gray-400 via-gray-500 to-gray-400 px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 rounded-t-2xl sm:rounded-t-3xl sticky top-0 z-10 border-b-2 border-gray-300/30">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white flex items-center space-x-2 sm:space-x-3">
                <span className="text-2xl sm:text-3xl md:text-4xl">📥</span>
                <span>Nueva Entrada de Productos</span>
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm sm:text-base font-bold text-gray-600 mb-2 sm:mb-3 flex items-center space-x-2">
                  <span>📅</span>
                  <span>Fecha de Entrada</span>
                </label>
                <div className="w-full px-3 sm:px-4 md:px-5 py-3 sm:py-4 bg-gray-50 border-2 border-gray-200 rounded-xl sm:rounded-2xl text-sm sm:text-base md:text-lg font-medium text-gray-600">
                  {new Date(fechaActual).toLocaleDateString('es-ES', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>

              <div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4 gap-3">
                  <label className="block text-sm sm:text-base font-bold text-gray-600 flex items-center space-x-2">
                    <span>📦</span>
                    <span>Productos</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const nuevoIndex = items.length;
                      setItems([...items, { producto: '', cantidad: 1, costo: 0 }]);
                      setBusqueda(prev => ({ ...prev, [nuevoIndex]: '' }));
                      setTimeout(() => {
                        const newInput = document.querySelector(`[data-row="${nuevoIndex}"][data-field="producto"]`) as HTMLInputElement;
                        newInput?.focus();
                      }, 100);
                    }}
                    className="bg-gradient-to-r from-gray-400 to-gray-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl hover:from-gray-500 hover:to-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 sm:hover:scale-110 font-bold flex items-center justify-center space-x-2 w-full sm:w-auto"
                  >
                    <span className="text-lg sm:text-xl">✨</span>
                    <span className="text-sm sm:text-base">Agregar Producto</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {/* Encabezado de la tabla - Solo visible en desktop */}
                  {items.length > 0 && (
                    <div className="hidden sm:grid grid-cols-12 gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-fuchsia-500 rounded-lg sm:rounded-xl text-white font-bold text-xs sm:text-sm">
                      <div className="col-span-5">💋 Producto</div>
                      <div className="col-span-2">📦 Cantidad</div>
                      <div className="col-span-2">💰 Costo</div>
                      <div className="col-span-2">✨ Subtotal</div>
                      <div className="col-span-1 text-center">🗑️</div>
                    </div>
                  )}

                  {/* Renglones de productos */}
                  {items.map((item, index) => (
                    <div 
                      key={index} 
                      className="bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 border-2 border-gray-200 rounded-xl hover:shadow-lg transition-all duration-300"
                    >
                      {/* Vista móvil: Stack vertical */}
                      <div className="block sm:hidden p-3 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-gray-600">💋 Producto</label>
                          <button
                            type="button"
                            onClick={() => eliminarItem(index)}
                            className="text-gray-500 hover:text-gray-700 transition-colors duration-200 text-lg font-bold"
                            title="Eliminar renglón"
                          >
                            🗑️
                          </button>
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            required={index === 0 || items.filter(i => i.producto).length > 0}
                            value={busqueda[index] || (item.producto ? productos.find(p => p._id === item.producto)?.nombre || '' : '')}
                            onChange={(e) => {
                              const texto = e.target.value;
                              if (items[index].producto && texto !== busqueda[index]) {
                                const nuevosItems = [...items];
                                nuevosItems[index] = { 
                                  ...nuevosItems[index], 
                                  producto: '',
                                  costo: 0
                                };
                                setItems(nuevosItems);
                              }
                              buscarProductos(texto, index);
                            }}
                            onKeyDown={(e) => handleKeyDown(e, index, 'producto')}
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
                            className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400 transition-all duration-300 font-medium bg-white"
                            placeholder="Buscar producto..."
                            autoComplete="off"
                          />
                          {mostrarSugerencias[index] && sugerencias[index] && sugerencias[index].length > 0 && (
                            <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-2xl max-h-48 overflow-y-auto">
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
                                  className="px-3 py-2 hover:bg-gradient-to-r hover:from-gray-50 hover:via-gray-100 hover:to-gray-50 cursor-pointer transition-all duration-200 border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-gradient-to-r focus:from-gray-100 focus:via-gray-200 focus:to-gray-100"
                                >
                                  <div className="font-bold text-gray-700 text-sm">{producto.nombre}</div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {producto.costo > 0 && <span>Costo: ${producto.costo.toFixed(2)}</span>}
                                    {producto.codigoBarras && <span className="ml-2">• Código: {producto.codigoBarras}</span>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">📦 Cantidad</label>
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
                              className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400 transition-all duration-300 font-medium bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">💰 Costo</label>
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
                              className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400 transition-all duration-300 font-medium bg-white"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                        <div className="pt-2 border-t border-gray-200">
                          <label className="block text-xs font-bold text-gray-600 mb-1">✨ Subtotal</label>
                          <span className="text-base font-bold text-gray-600">
                            ${(item.cantidad * item.costo).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      {/* Vista desktop: Grid */}
                      <div className="hidden sm:grid grid-cols-12 gap-2 sm:gap-3 p-3 sm:p-4">
                        <div className="col-span-5 relative">
                          <input
                            type="text"
                            required={index === 0 || items.filter(i => i.producto).length > 0}
                            value={busqueda[index] || (item.producto ? productos.find(p => p._id === item.producto)?.nombre || '' : '')}
                            onChange={(e) => {
                              const texto = e.target.value;
                              if (items[index].producto && texto !== busqueda[index]) {
                                const nuevosItems = [...items];
                                nuevosItems[index] = { 
                                  ...nuevosItems[index], 
                                  producto: '',
                                  costo: 0
                                };
                                setItems(nuevosItems);
                              }
                              buscarProductos(texto, index);
                            }}
                            onKeyDown={(e) => handleKeyDown(e, index, 'producto')}
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
                            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-gray-300 focus:border-gray-400 transition-all duration-300 font-medium bg-white"
                            placeholder="Buscar producto..."
                            autoComplete="off"
                          />
                          {mostrarSugerencias[index] && sugerencias[index] && sugerencias[index].length > 0 && (
                            <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-2xl max-h-60 overflow-y-auto">
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
                                  className="px-4 py-3 hover:bg-gradient-to-r hover:from-gray-50 hover:via-gray-100 hover:to-gray-50 cursor-pointer transition-all duration-200 border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-gradient-to-r focus:from-gray-100 focus:via-gray-200 focus:to-gray-100"
                                >
                                  <div className="font-bold text-gray-700">{producto.nombre}</div>
                                  <div className="text-sm text-gray-500 mt-1 flex items-center space-x-2">
                                    {producto.costo > 0 && <span>Costo: ${producto.costo.toFixed(2)}</span>}
                                    {producto.codigoBarras && <span>• Código: {producto.codigoBarras}</span>}
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
                            required={index === 0 || item.producto !== ''}
                            value={item.cantidad}
                            onChange={(e) =>
                              actualizarItem(index, 'cantidad', parseInt(e.target.value) || 1)
                            }
                            onKeyDown={(e) => handleKeyDown(e, index, 'cantidad')}
                            data-row={index}
                            data-field="cantidad"
                            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-gray-300 focus:border-gray-400 transition-all duration-300 font-medium bg-white"
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
                            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-gray-300 focus:border-gray-400 transition-all duration-300 font-medium bg-white"
                            placeholder="0.00"
                          />
                        </div>
                        <div className="col-span-2 flex items-center">
                          <span className="text-sm sm:text-base font-bold text-gray-600">
                            ${(item.cantidad * item.costo).toFixed(2)}
                          </span>
                        </div>
                        <div className="col-span-1 flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => eliminarItem(index)}
                            className="text-gray-500 hover:text-gray-700 transition-colors duration-200 text-lg sm:text-xl font-bold"
                            title="Eliminar renglón"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {items.filter(item => item.producto && item.cantidad > 0 && item.costo >= 0).length > 0 && (
                <div className="bg-gradient-to-r from-gray-100 to-gray-200 border-2 border-gray-300 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 mb-3 sm:mb-4 shadow-lg">
                  <p className="text-sm sm:text-base font-bold text-gray-700">
                    💎 Total de la Entrada: ${items
                      .filter(item => item.producto && item.cantidad > 0 && item.costo >= 0)
                      .reduce((sum, item) => sum + item.cantidad * item.costo, 0)
                      .toFixed(2)}
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:justify-end gap-3 sm:gap-4 pt-4 sm:pt-6 border-t-2 border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setItems([]);
                    setBusqueda({});
                    setSugerencias({});
                    setMostrarSugerencias({});
                  }}
                  className="px-6 sm:px-8 py-3 sm:py-4 border-2 border-gray-300 rounded-xl sm:rounded-2xl text-gray-600 font-bold hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 w-full sm:w-auto text-sm sm:text-base"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={items.filter(item => item.producto && item.cantidad > 0 && item.costo >= 0).length === 0}
                  className={`px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold transition-all duration-300 shadow-2xl hover:shadow-gray-400/50 transform hover:scale-105 sm:hover:scale-110 flex items-center justify-center space-x-2 w-full sm:w-auto text-sm sm:text-base ${
                    items.filter(item => item.producto && item.cantidad > 0 && item.costo >= 0).length === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-gray-400 via-gray-500 to-gray-400 text-white hover:from-gray-500 hover:via-gray-600 hover:to-gray-500'
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

