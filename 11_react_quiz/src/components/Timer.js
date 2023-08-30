import { useEffect } from 'react';

function Timer({ dispatch, secondsRemaining }) {
  const mins = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  useEffect(
    function () {
      const idTimer = setInterval(function () {
        // Esta función se ejecuta cada segundo
        dispatch({ type: 'tick' });
      }, 1000);
      //cleanUp function
      return () => clearInterval(idTimer);
    },
    [dispatch]
  );
  return (
    <div className='timer'>
      {mins < 10 && '0'}
      {mins}:{seconds < 10 && '0'}
      {seconds}
    </div>
  );
}

export default Timer;
