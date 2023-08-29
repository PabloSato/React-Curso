import { useEffect } from 'react';

export function useKey(key, action) {
  useEffect(
    function () {
      function callback(e) {
        if (e.code.toLowerCase() === key.toLowerCase()) action();
      }
      document.addEventListener('keydown', callback);
      // Cada vez que abramos una movie, se añade el eventListener a ella, podemos acabar teniendo decenas de eventos, ESO NO LO QUEREMOS
      // Por ello necesitamos una función cleanup que elimine el eventListener ya que podríamos acabar con un problema de memoria
      return function () {
        document.removeEventListener('keydown', callback);
      };
    },
    [key, action]
  );
}
