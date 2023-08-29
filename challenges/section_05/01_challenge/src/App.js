// `https://api.frankfurter.app/latest?amount=100&from=EUR&to=USD`

import { useEffect, useState } from 'react';

// Como es un ejercicio NO HACEMOS CASO AL CONTROL DE ERRORES.... en la vida real hay que mirarlo SIEMPRE

export default function App() {
  const [amount, setAmount] = useState(1);
  const [fromCur, setFromCur] = useState('EUR');
  const [toCur, setToCur] = useState('USD');
  const [converted, setConverted] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(
    function () {
      async function convert() {
        setIsLoading(true);
        const response = await fetch(
          `https://api.frankfurter.app/latest?amount=${amount}&from=${fromCur}&to=${toCur}`
        );
        const data = await response.json();
        setConverted(data.rates[toCur]);
        setIsLoading(false);
      }
      // Si fromCur es igual a toCur, no ejecutamos la funcion
      if (fromCur === toCur) return setConverted(amount);
      convert();
    },
    [amount, fromCur, toCur] // => Tenemos que añadir los tres para que se ejecute este useEffect cada vez que ALGUNO CAMBIE
  );

  return (
    <div>
      <input
        type='text'
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        disabled={isLoading}
      />
      <select
        value={fromCur}
        onChange={(e) => setFromCur(e.target.value)}
        disabled={isLoading}
      >
        <option value='USD'>USD</option>
        <option value='EUR'>EUR</option>
        <option value='CAD'>CAD</option>
        <option value='INR'>INR</option>
      </select>
      <select
        value={toCur}
        onChange={(e) => setToCur(e.target.value)}
        disabled={isLoading}
      >
        <option value='USD'>USD</option>
        <option value='EUR'>EUR</option>
        <option value='CAD'>CAD</option>
        <option value='INR'>INR</option>
      </select>
      <p>
        {converted} {toCur}
      </p>
    </div>
  );
}
