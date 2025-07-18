import React, { useState } from 'react';
import { Globe, Send, Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface SummaryResponse {
  summary?: string;
  title?: string;
  error?: string;
}

function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SummaryResponse | null>(null);
  const [error, setError] = useState('');

  const isValidUrl = (urlString: string): boolean => {
    try {
      const url = new URL(urlString);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('Por favor, ingresa una URL');
      return;
    }

    if (!isValidUrl(url)) {
      setError('Por favor, ingresa una URL válida (debe incluir http:// o https://)');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos timeout

      const response = await fetch('https://n8n-k674.onrender.com/webhook-test/886247b6-0590-49aa-95a2-9f4c747f4ec9', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.summary && !data.text && !data.content) {
        throw new Error('No se pudo obtener un resumen del contenido');
      }

      setResult({
        summary: data.summary || data.text || data.content,
        title: data.title || 'Resumen de contenido'
      });

    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          setError('La solicitud tardó demasiado tiempo. Por favor, intenta de nuevo.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Ocurrió un error inesperado. Por favor, verifica la URL e intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setUrl('');
    setResult(null);
    setError('');
  };

  const urlInputClasses = `
    w-full px-4 py-3 border-2 rounded-xl text-gray-900 placeholder-gray-500
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500
    ${error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'}
  `;

  const buttonClasses = `
    flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold
    transition-all duration-200 ease-in-out transform
    focus:outline-none focus:ring-4 focus:ring-blue-100
    ${loading 
      ? 'bg-gray-400 cursor-not-allowed' 
      : 'bg-blue-600 hover:bg-blue-700 hover:scale-105 active:scale-95 text-white shadow-lg hover:shadow-xl'
    }
  `;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              URL Summarizer
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Convierte cualquier artículo web en un resumen conciso y fácil de leer. 
            Simplemente pega la URL y obtén la información clave en segundos.
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="url" className="block text-sm font-semibold text-gray-700 mb-3">
                URL del artículo o página web
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="url"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="https://ejemplo.com/articulo"
                  className={urlInputClasses}
                  disabled={loading}
                />
                {url && isValidUrl(url) && !loading && (
                  <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
              {error && (
                <div className="flex items-center gap-2 mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading || !url.trim()}
                className={buttonClasses}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                {loading ? 'Procesando...' : 'Generar Resumen'}
              </button>

              {(result || error) && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                >
                  <RefreshCw className="w-5 h-5" />
                  Nuevo
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
                <Globe className="w-6 h-6 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">
                Analizando contenido...
              </h3>
              <p className="text-gray-600 text-center max-w-md">
                Estamos extrayendo y procesando el contenido de la página. 
                Esto puede tomar unos momentos.
              </p>
            </div>
          </div>
        )}

        {/* Resultados */}
        {result && !loading && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-fadeIn">
            <div className="bg-gradient-to-r from-green-500 to-blue-600 p-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-white" />
                <h3 className="text-xl font-bold text-white">Resumen Generado</h3>
              </div>
            </div>
            
            <div className="p-8">
              {result.title && (
                <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">
                  {result.title}
                </h4>
              )}
              
              <div className="prose max-w-none">
                <p className="text-gray-800 leading-relaxed text-base whitespace-pre-line">
                  {result.summary}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Fuente: <span className="font-medium">{url}</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p className="text-sm">
            Desarrollado con React y Tailwind CSS • 
            Procesamiento inteligente de contenido web
          </p>
        </div>
      </div>

      {/* Estilos adicionales */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}

export default App;