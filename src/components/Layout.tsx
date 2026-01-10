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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-fuchsia-50">
      <nav className="bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 text-white shadow-2xl sticky top-0 z-50 backdrop-blur-md border-b border-purple-400/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-pink-400 to-purple-500 p-3 rounded-2xl shadow-lg backdrop-blur-sm border border-white/30">
                <span className="text-4xl">💄</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-pink-100 bg-clip-text text-transparent">
                  Beauty Inventory
                </h1>
                <p className="text-sm text-purple-100 opacity-95 font-medium mt-0.5">Gestión de productos de belleza</p>
              </div>
            </div>
            <div className="flex space-x-3 items-center">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={`px-5 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 relative overflow-hidden group ${
                    isActive(item.href)
                      ? 'bg-white text-purple-700 shadow-xl scale-105 ring-2 ring-purple-300'
                      : 'hover:bg-white/25 hover:scale-105 text-white hover:shadow-lg'
                  }`}
                >
                  <span className="relative z-10 text-xl">{item.icon}</span>
                  <span className="relative z-10">{item.label}</span>
                  {isActive(item.href) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-100 to-pink-100 opacity-50"></div>
                  )}
                </a>
              ))}
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {children}
      </main>

      {/* Modal de ayuda de atajos */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-2xl transform transition-all animate-slideUp border-2 border-purple-200/50">
            <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-fuchsia-600 px-8 py-6 rounded-t-3xl border-b-2 border-purple-400/30">
              <div className="flex justify-between items-center">
                <h3 className="text-3xl font-bold text-white flex items-center space-x-3">
                  <span className="text-4xl">⌨️</span>
                  <span>Atajos de Teclado</span>
                </h3>
                <button
                  onClick={() => setShowShortcuts(false)}
                  className="text-white hover:text-pink-200 transition-colors duration-200 text-2xl font-bold w-10 h-10 rounded-full hover:bg-white/20 flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border-2 border-purple-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-lg font-bold text-lg">1</span>
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-lg font-bold text-lg">I</span>
                    <span className="text-purple-800 font-bold text-lg">Inventario</span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border-2 border-purple-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-lg font-bold text-lg">2</span>
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-lg font-bold text-lg">E</span>
                    <span className="text-purple-800 font-bold text-lg">Entradas</span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border-2 border-purple-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-lg font-bold text-lg">3</span>
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-lg font-bold text-lg">S</span>
                    <span className="text-purple-800 font-bold text-lg">Salidas</span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border-2 border-purple-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-lg font-bold text-lg">4</span>
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-lg font-bold text-lg">G</span>
                    <span className="text-purple-800 font-bold text-lg">Ganancias</span>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-5 border-2 border-pink-200 mt-4">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-3 py-1 rounded-lg font-bold text-lg">?</span>
                  <span className="text-purple-800 font-bold text-lg">Mostrar/Ocultar ayuda</span>
                </div>
                <p className="text-purple-600 text-sm mt-2 ml-12">Presiona ESC para cerrar este modal</p>
              </div>
              <div className="flex justify-end pt-4 border-t-2 border-purple-100">
                <button
                  onClick={() => setShowShortcuts(false)}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-500 to-fuchsia-600 text-white rounded-2xl font-bold hover:from-purple-700 hover:via-pink-600 hover:to-fuchsia-700 transition-all duration-300 shadow-2xl hover:shadow-purple-500/50 transform hover:scale-110"
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

