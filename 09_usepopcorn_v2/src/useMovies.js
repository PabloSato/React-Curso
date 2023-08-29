import { useEffect, useState } from 'react';

const API_KEY = 'fd6c39f';

export function useMovies(query, callback) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(
    function () {
      callback?.();
      // Controlamos las peticiones fetch para que solo se ejecute la última y no todas las intermedias mientras escribimos en el buscador
      // Usamos el API del navegador => AbortController no tiene nada que ver con React (OJO!!)
      const controller = new AbortController();
      async function fetchMovies() {
        try {
          setIsLoading(true);
          setError('');
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${API_KEY}&s=${query}`,
            { signal: controller.signal }
          );
          // -- Handle Connection Errors --
          if (!res.ok)
            throw new Error('Something went wrong with fetching movies');
          const data = await res.json();
          // -- Handle Not Found Errors --
          if (data.Response === 'False') throw new Error(data.Error);
          // -- Set the data fetch
          setMovies(data.Search);
          setError('');
        } catch (err) {
          // -- Evitamos el 'user aborted' error para que siga pintando la data del fetch
          if (err.name !== 'AbortError') {
            console.error(err.message);
            setError(err.message);
          }
        } finally {
          // Esto se ejecuta SIEMPRE
          setIsLoading(false);
        }
      }

      // Si NO estmos buscando peliculas, que no haga el fetch
      if (query.length < 2) {
        setMovies([]);
        setError('');
        return;
      }
      // Cerramos la pelicula que tengamos abierta
      //handleCloseMovie(); // => esto nos lo cargamos al usar el useMovies, ahora es el callback del principio
      // Llamamos a la función para ejecutarla
      fetchMovies();

      // Add cleanup function
      return function () {
        // Cada vez que añadimos una nueva letra en el buscador, el componente se rerenderiza, lo que ejecuta esta cleanup function
        //y aborta el fetch que esté en ejecución
        controller.abort();
      };
    },
    [query]
    //Tenemos que pasarle el query en el array de dependencias para que pueda ejecutar su llamada dentro del useEffect
  );
  return { movies, isLoading, error };
}
