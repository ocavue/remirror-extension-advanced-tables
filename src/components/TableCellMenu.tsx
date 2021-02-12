import { useEvents } from '@remirror/react-hooks';
import React, { useState } from 'react';
import { useBlockPositioner } from '../block-positioner';

export function TableCellMenu() {
  const { ref, bottom, right, top } = useBlockPositioner(['tableCell', 'tableHeaderCell']);

  const [popupOpen, setPopupOpen] = useState(false);

  useEvents('mousedown', () => {
    popupOpen && setPopupOpen(false);
    return false;
  });

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        right,
        top,
        height: (bottom ?? 0) - (top ?? 0),
        minHeight: 20,
        minWidth: 20,
        zIndex: 5,
      }}
    >
      <div>
        <button onClick={() => setPopupOpen(true)} style={{ position: 'relative', left: '-18px' }}>
          v
        </button>
        {popupOpen && <div style={{ position: 'fixed', backgroundColor: 'white', border: '1px solid red' }}>MENU</div>}
      </div>
    </div>
  );
}

export default TableCellMenu;
