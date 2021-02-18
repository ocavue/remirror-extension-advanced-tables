import { useEvents } from '@remirror/react-hooks';
import React, { useState } from 'react';
import { useBlockPositioner } from '../block-positioner';

export type TableCellMenuButtonProps = {
  setPopupOpen: (open: boolean) => void;
};
export type TableCellMenuButton = React.ComponentType<TableCellMenuButtonProps>;

export const DefaultTableCellMenuButton: React.FC<TableCellMenuButtonProps> = ({ setPopupOpen }) => {
  return (
    <button onClick={() => setPopupOpen(true)} style={{ position: 'relative', left: '-18px' }}>
      v
    </button>
  );
};

export type TableCellMenuPapperProps = Record<string, never>;
export type TableCellMenuPopup = React.ComponentType<TableCellMenuPapperProps>;

export const DefaultTableCellMenuPopup: React.FC<TableCellMenuPapperProps> = () => {
  return <div style={{ position: 'fixed', backgroundColor: 'white', border: '1px solid red' }}>MENU</div>;
};

export type TableCellMenuProps = { Button: TableCellMenuButton; Popup: TableCellMenuPopup };

const TableCellMenu: React.FC<TableCellMenuProps> = ({ Button = DefaultTableCellMenuButton, Popup = DefaultTableCellMenuPopup }) => {
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
        <Button setPopupOpen={setPopupOpen} />
        {popupOpen && <Popup />}
      </div>
    </div>
  );
};

export { TableCellMenu };
export default TableCellMenu;
