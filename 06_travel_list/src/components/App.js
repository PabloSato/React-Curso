import { useState } from 'react';
import Logo from './Logo';
import Form from './Form';
import PackingList from './PackingList';
import Stats from './Stats';

const initialItems = [
  { id: 1, description: 'Passports', quantity: 2, packed: false },
  { id: 2, description: 'Socks', quantity: 12, packed: false },
  { id: 3, description: 'Charger', quantity: 1, packed: false },
];

export default function App() {
  const [items, setItems] = useState(initialItems);

  function handleAddItems(item) {
    // No podemos usar .push porque React no lo permite, la forma de añadir algo a un array ya existente
    // es creando uno nuevo a partir del anterior. En este caso:
    // - items: es el array con todos los item
    // - item: es el nuevo item que pasamos
    setItems((items) => [...items, item]);
  }

  function handleDeleteItems(id) {
    // La función filter() crea un nuevo array a partir del que tenemos.  Si item.id es DISTINTO al id, entonces pasa al nuevo array
    // De esta forma dejamos fuera el item con el id que recibimos
    setItems((items) => items.filter((item) => item.id !== id));
  }

  function handleToggleItem(id) {
    // Si el id del item coincide con el id que recibimos, cambiamos el valor de packed por su contrario
    setItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, packed: !item.packed } : item
      )
    );
  }

  function handleClearItems() {
    const confirmed = window.confirm(
      'Are you sure you want to delete all items?'
    );

    if (confirmed) setItems([]);
  }

  return (
    <div className='app'>
      <Logo />
      <Form onAddItems={handleAddItems} />
      <PackingList
        items={items}
        onDeleteItems={handleDeleteItems}
        onToggleItems={handleToggleItem}
        onClearItems={handleClearItems}
      />
      <Stats items={items} />
    </div>
  );
}
