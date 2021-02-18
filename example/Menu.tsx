import React from 'react';

interface MenuProps {
  createTable: (params: { columnsCount: number; rowsCount: number; withHeaderRow?: boolean }) => void;
}

const Menu: React.FC<MenuProps> = ({ createTable }) => {
  return (
    <div>
      <button onClick={() => createTable({ rowsCount: 3, columnsCount: 3 })}>insert a 3*3 table</button>
      <button onClick={() => createTable({ rowsCount: 5, columnsCount: 5 })}>insert a 5*5 table</button>
      <button onClick={() => createTable({ rowsCount: 8, columnsCount: 100 })}>insert a 8*100 table</button>
    </div>
  );
};

export default Menu;
