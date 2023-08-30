import React from 'react';

// Así se trabaja antes con CLASES (esto está 'deprecado')
class Counter extends React.Component {
  // Para poder usar el State hay que usar el constructor
  constructor(props) {
    super(props);

    this.state = { count: 5 };
  }

  // Siempre hay que incluir el método render()
  render() {
    return (
      <div>
        <button>-</button>
        <span>{this.state.count}</span>
        <button>+</button>
      </div>
    );
  }
}

export default Counter;
