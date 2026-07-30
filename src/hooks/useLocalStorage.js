import { useEffect, useState } from 'react';

/**
 * Hook genérico para mantener un estado sincronizado con localStorage.
 * Uso: const [value, setValue] = useLocalStorage('mi_clave', valorPorDefecto);
 */
export function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Almacenamiento no disponible (modo privado, cuota excedida, etc.)
    }
  }, [key, value]);

  return [value, setValue];
}

export default useLocalStorage;
