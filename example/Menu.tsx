import React from 'react';

interface MenuProps {
  createTable: (params: { columnsCount: number; rowsCount: number; withHeaderRow?: boolean }) => void;
}

const Menu: React.FC<MenuProps> = ({ createTable }) => {
  return (
    <div>
      <button data-testid='btn-3-3' onClick={() => createTable({ rowsCount: 3, columnsCount: 3, withHeaderRow: false })}>
        insert a 3*3 table
      </button>
      <button data-testid='btn-5-5' onClick={() => createTable({ rowsCount: 5, columnsCount: 5, withHeaderRow: false })}>
        insert a 5*5 table
      </button>
      <button data-testid='btn-8-100' onClick={() => createTable({ rowsCount: 100, columnsCount: 8, withHeaderRow: false })}>
        insert a 8*100 table
      </button>
    </div>
  );
};

export default Menu;
