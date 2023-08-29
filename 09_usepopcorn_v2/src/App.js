import { useEffect, useState } from 'react';
import StarRating from './StarRating';

export const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const API_KEY = 'fd6c39f';

export default function App() {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [watched, setWatched] = useState(function () {
    // Podemos pasar una función anónima (sin argumentos) como valor inicial
    // desde dónde podemos leer el valor del localStorage
    const storedMovies = localStorage.getItem('watched');
    return JSON.parse(storedMovies);
  });

  function handleSelectMovie(id) {
    setSelectedId((selectedId) => (id === selectedId ? null : id));
  }

  function handleCloseMovie() {
    setSelectedId(null);
  }

  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);

    // LO MEJOR ES HACERLO EN EL useEffect
    // Guardamos en LocalStorage a lista de peliculas añadidas para persistirlas
    // Como el setWatched es ASINCRONO, debemos de hacer lo mismo que en el set, para añadirlo
    // En localStorage se guardan como pair=>value de strings, hay que convertirlo a string
    // localStorage.setItem('watched', JSON.stringify([...watched, movie]));
  }

  function handleDeleteWatched(id) {
    // Filtramos el array de watched y dejamos solo aquellas cuyo id sea DISTINTO al id que recibimos
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  useEffect(
    function () {
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
      handleCloseMovie();
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

  useEffect(
    function () {
      // Este useEffect solo se ejecuta después de que se haya actualziado el useState
      // por lo que podemos usar directamente el array watched
      // Este useEffect tamnbén se encarga de actualizar el valor de watched(cuando eliminamos de la lista)
      localStorage.setItem('watched', JSON.stringify(watched));
    },
    [watched]
  );

  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>
      <Main>
        <Box>
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MovieList movies={movies} onSelecteMovie={handleSelectMovie} />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>
        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              watched={watched}
              onCloseMovie={handleCloseMovie}
              onAddWatched={handleAddWatched}
            />
          ) : (
            <>
              <WatchSummary watched={watched} />
              <WatchedMovieList
                watched={watched}
                onDeleteWatched={handleDeleteWatched}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

// --------------------------------------- COMPONENTS ----------------------------------------------------
function Main({ children }) {
  return <main className='main'>{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className='box'>
      <button className='btn-toggle' onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? '–' : '+'}
      </button>
      {isOpen && children}
    </div>
  );
}

function MovieList({ movies, onSelecteMovie, onCloseMovie }) {
  return (
    <ul className='list list-movies'>
      {movies?.map((movie) => (
        <Movie
          movie={movie}
          key={movie.imdbID}
          onSelecteMovie={onSelecteMovie}
        />
      ))}
    </ul>
  );
}

function Movie({ movie, onSelecteMovie }) {
  return (
    <li onClick={() => onSelecteMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function MovieDetails({ selectedId, watched, onCloseMovie, onAddWatched }) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState('');

  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);
  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating;

  //Destructuramos la data para renombrar los campos como queramos nosotros
  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(' ').at(0)),
      userRating,
    };
    onAddWatched(newWatchedMovie);
    onCloseMovie();
  }

  // Con este useEffect cargamos los detalles de la pelicula seleccionada
  useEffect(
    function () {
      async function getMovieDetails() {
        setIsLoading(true);
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${API_KEY}&i=${selectedId}`
        );

        const data = await res.json();
        setMovie(data);
        setIsLoading(false);
      }
      getMovieDetails();
    },
    [selectedId]
  );

  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie | ${title}`;

      // Función cleanup => para borrar el seide-effect al desmontar el componente (resetea el titulo de la pgina)
      return function () {
        document.title = 'usePopcorn';
      };
    },
    [title]
  );

  useEffect(
    function () {
      function callback(e) {
        if (e.code === 'Escape') onCloseMovie();
      }
      document.addEventListener('keydown', callback);
      // Cada vez que abramos una movie, se añade el eventListener a ella, podemos acabar teniendo decenas de eventos, ESO NO LO QUEREMOS
      // Por ello necesitamos una función cleanup que elimine el eventListener ya que podríamos acabar con un problema de memoria
      return function () {
        document.removeEventListener('keydown', callback);
      };
    },
    [onCloseMovie]
  );

  return (
    <div className='details'>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className='btn-back' onClick={onCloseMovie}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of ${title} movie`} />
            <div className='details-overview'>
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐️</span>
                {imdbRating} IMDb rating
              </p>
            </div>
          </header>

          <section>
            <div className='rating'>
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                  />
                  {userRating > 0 && (
                    <button className='btn-add' onClick={handleAdd}>
                      + Add to list
                    </button>
                  )}
                </>
              ) : (
                <p>
                  You rated with {watchedUserRating} <span>⭐️</span>
                </p>
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}

function WatchSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className='summary'>
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMovieList({ watched, onDeleteWatched }) {
  return (
    <ul className='list'>
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          onDeleteWatched={onDeleteWatched}
        />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie, onDeleteWatched }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>

        <button
          className='btn-delete'
          onClick={() => onDeleteWatched(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
}

function Loader() {
  return <p className='loader'>Loading...</p>;
}

function ErrorMessage({ message }) {
  return (
    <p className='error'>
      <span>⛔️</span> {message}
    </p>
  );
}

// --------------------------------------- PARTIALS ----------------------------------------------------

function NavBar({ children }) {
  return (
    <nav className='nav-bar'>
      <Logo />
      {children}
    </nav>
  );
}

function Logo() {
  return (
    <div className='logo'>
      <span role='img'>🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function NumResults({ movies }) {
  return (
    <p className='num-results'>
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function Search({ query, setQuery }) {
  return (
    <input
      className='search'
      type='text'
      placeholder='Search movies...'
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}
