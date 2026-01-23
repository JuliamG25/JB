import { type ReactNode, useState, useEffect } from 'react';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [currentPath, setCurrentPath] = useState('/');
  const [showShortcuts, setShowShortcuts] = useState(false);

  useEffect(() => {
    // Función para actualizar el path actual
    const updatePath = () => {
      setCurrentPath(window.location.pathname);
    };
    
    // Actualizar al montar
    updatePath();
    
    // Escuchar cambios en el historial (botón atrás/adelante del navegador)
    window.addEventListener('popstate', updatePath);
    
    // En Astro, los enlaces normales recargan la página, así que solo necesitamos
    // actualizar cuando el componente se monta o cuando se usa el botón atrás/adelante
    return () => {
      window.removeEventListener('popstate', updatePath);
    };
  }, []); // Sin dependencias para evitar loops

  // Atajos de teclado para navegación
  useKeyboardShortcuts([
    {
      key: '1',
      handler: () => {
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
      },
      description: 'Ir a Inventario',
    },
    {
      key: '2',
      handler: () => {
        if (window.location.pathname !== '/entradas') {
          window.location.href = '/entradas';
        }
      },
      description: 'Ir a Entradas',
    },
    {
      key: '3',
      handler: () => {
        if (window.location.pathname !== '/salidas') {
          window.location.href = '/salidas';
        }
      },
      description: 'Ir a Salidas',
    },
    {
      key: '4',
      handler: () => {
        if (window.location.pathname !== '/ganancias') {
          window.location.href = '/ganancias';
        }
      },
      description: 'Ir a Ganancias',
    },
    {
      key: 'i',
      handler: () => {
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
      },
      description: 'Ir a Inventario',
    },
    {
      key: 'e',
      handler: () => {
        if (window.location.pathname !== '/entradas') {
          window.location.href = '/entradas';
        }
      },
      description: 'Ir a Entradas',
    },
    {
      key: 's',
      handler: () => {
        if (window.location.pathname !== '/salidas') {
          window.location.href = '/salidas';
        }
      },
      description: 'Ir a Salidas',
    },
    {
      key: 'g',
      handler: () => {
        if (window.location.pathname !== '/ganancias') {
          window.location.href = '/ganancias';
        }
      },
      description: 'Ir a Ganancias',
    },
    {
      key: '?',
      handler: () => {
        setShowShortcuts(!showShortcuts);
      },
      description: 'Mostrar/Ocultar ayuda de atajos',
    },
    {
      key: 'Escape',
      handler: () => {
        if (showShortcuts) {
          setShowShortcuts(false);
        }
      },
      description: 'Cerrar ayuda',
    },
  ]);

  const navItems = [
    { href: '/', label: 'Inventario', icon: '📦' },
    { href: '/entradas', label: 'Entradas', icon: '📥' },
    { href: '/salidas', label: 'Salidas', icon: '📤' },
    { href: '/ganancias', label: 'Ganancias', icon: '💰' },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return currentPath === '/' || currentPath === '';
    }
    return currentPath === href || currentPath.startsWith(href + '/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      <nav className="bg-gradient-to-r from-gray-400 via-gray-500 to-gray-500 text-white shadow-2xl sticky top-0 z-50 backdrop-blur-md border-b border-purple-400/20">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center h-auto sm:h-24 py-3 sm:py-0">
            <div className="flex items-center space-x-2 sm:space-x-4 mb-3 sm:mb-0 w-full sm:w-auto">
              <div className="bg-gradient-to-br from-gray-300 to-gray-400 p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-lg backdrop-blur-sm border border-white/30">
                <span className="text-2xl sm:text-3xl md:text-4xl">💄</span>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-pink-100 bg-clip-text text-transparent">
                  Beauty Inventory
                </h1>
                <p className="text-xs sm:text-sm text-gray-100 opacity-95 font-medium mt-0.5 hidden sm:block">Gestión de productos de belleza</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:flex sm:space-x-2 lg:space-x-3 items-center w-full sm:w-auto gap-2 sm:gap-0">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={`px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 lg:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-1 sm:space-x-2 relative overflow-hidden group text-sm sm:text-base ${
                    isActive(item.href)
                      ? 'bg-white text-purple-700 shadow-xl scale-105 ring-2 ring-gray-300'
                      : 'hover:bg-white/25 hover:scale-105 text-white hover:shadow-lg'
                  }`}
                >
                  <span className="relative z-10 text-lg sm:text-xl">{item.icon}</span>
                  <span className="relative z-10 hidden sm:inline">{item.label}</span>
                  {isActive(item.href) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200 opacity-50"></div>
                  )}
                </a>
              ))}
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-6 sm:py-8 lg:py-10">
        {children}
      </main>

      {/* Modal de ayuda de atajos */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4 animate-fadeIn">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all animate-slideUp border-2 border-gray-200/50">
            <div className="bg-gradient-to-r from-gray-400 via-gray-500 to-gray-400 px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 rounded-t-2xl sm:rounded-t-3xl border-b-2 border-purple-400/30 sticky top-0 z-10">
              <div className="flex justify-between items-center">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white flex items-center space-x-2 sm:space-x-3">
                  <span className="text-2xl sm:text-3xl md:text-4xl">⌨️</span>
                  <span>Atajos de Teclado</span>
                </h3>
                <button
                  onClick={() => setShowShortcuts(false)}
                  className="text-white hover:text-gray-200 transition-colors duration-200 text-xl sm:text-2xl font-bold w-8 h-8 sm:w-10 sm:h-10 rounded-full hover:bg-white/20 flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-5 border-2 border-gray-200">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 sm:px-3 py-1 rounded-lg font-bold text-sm sm:text-base md:text-lg">1</span>
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 sm:px-3 py-1 rounded-lg font-bold text-sm sm:text-base md:text-lg">I</span>
                    <span className="text-gray-600 font-bold text-sm sm:text-base md:text-lg">Inventario</span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-5 border-2 border-gray-200">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 sm:px-3 py-1 rounded-lg font-bold text-sm sm:text-base md:text-lg">2</span>
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 sm:px-3 py-1 rounded-lg font-bold text-sm sm:text-base md:text-lg">E</span>
                    <span className="text-gray-600 font-bold text-sm sm:text-base md:text-lg">Entradas</span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-5 border-2 border-gray-200">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 sm:px-3 py-1 rounded-lg font-bold text-sm sm:text-base md:text-lg">3</span>
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 sm:px-3 py-1 rounded-lg font-bold text-sm sm:text-base md:text-lg">S</span>
                    <span className="text-gray-600 font-bold text-sm sm:text-base md:text-lg">Salidas</span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-5 border-2 border-gray-200">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 sm:px-3 py-1 rounded-lg font-bold text-sm sm:text-base md:text-lg">4</span>
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 sm:px-3 py-1 rounded-lg font-bold text-sm sm:text-base md:text-lg">G</span>
                    <span className="text-gray-600 font-bold text-sm sm:text-base md:text-lg">Ganancias</span>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-5 border-2 border-pink-200 mt-3 sm:mt-4">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                  <span className="bg-gradient-to-r from-gray-400 to-gray-500 text-white px-2 sm:px-3 py-1 rounded-lg font-bold text-sm sm:text-base md:text-lg">?</span>
                  <span className="text-gray-600 font-bold text-sm sm:text-base md:text-lg">Mostrar/Ocultar ayuda</span>
                </div>
                <p className="text-purple-600 text-xs sm:text-sm mt-2 ml-0 sm:ml-12">Presiona ESC para cerrar este modal</p>
              </div>
              <div className="flex justify-end pt-3 sm:pt-4 border-t-2 border-purple-100">
                <button
                  onClick={() => setShowShortcuts(false)}
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-gray-400 via-gray-500 to-gray-400 text-white rounded-xl sm:rounded-2xl font-bold hover:from-gray-500 hover:via-gray-600 hover:to-gray-500 transition-all duration-300 shadow-2xl hover:shadow-gray-400/50 transform hover:scale-105 sm:hover:scale-110 text-sm sm:text-base w-full sm:w-auto"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

