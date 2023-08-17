import { useState } from 'react';

const messages = [
  'Learn React ⚛️',
  'Apply for jobs 💼',
  'Invest your new income 🤑',
];

export default function App() {
  return (
    <div>
      <Steps />
      {/* <Steps /> */}
    </div>
  );
}

function Steps() {
  //useState acepta un parámetro que representa el valor por defecto y devuelve el valor y la función para actualizarlo
  const [step, setStep] = useState(1);
  const [isOpen, setIsOpen] = useState(true);

  function handlePrevious() {
    // if (step > 1) setStep(step - 1);
    //BETTER WAY AND PRACTICE
    if (step > 1) setStep((s) => s - 1);
  }

  function handleNext() {
    if (step < 3) setStep((s) => s + 1);
  }

  return (
    <>
      <button className='close' onClick={() => setIsOpen((isOp) => !isOp)}>
        &times;
      </button>
      {isOpen && (
        <div className='steps'>
          <div className='numbers'>
            <div className={`${step >= 1 ? 'active' : ''}`}>1</div>
            <div className={`${step >= 2 ? 'active' : ''}`}>2</div>
            <div className={`${step >= 3 ? 'active' : ''}`}>3</div>
          </div>

          <p className='message'>
            Step {step}: {messages[step - 1]}
          </p>

          <div className='buttons'>
            <Button
              textColor='#fff'
              bgColor='#7950f2'
              onClick={handlePrevious}
              text='Previous'
              emoji='👈'
            />
            <Button
              textColor='#fff'
              bgColor='#7950f2'
              onClick={handleNext}
              text='Next'
              emoji='👉'
            />
          </div>
        </div>
      )}
    </>
  );
}

function Button({ textColor, bgColor, onClick, text, emoji }) {
  return (
    <button
      style={{ backgroundColor: `${bgColor}`, color: `${textColor}` }}
      onClick={onClick}
    >
      {text}
      <span>{emoji}</span>
    </button>
  );
}
