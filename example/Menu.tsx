import { useRemirrorContext } from '@remirror/react';
import React from 'react';

const Menu: React.FC = () => {
  const { commands } = useRemirrorContext();
  const createTable = commands.createTable;

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
