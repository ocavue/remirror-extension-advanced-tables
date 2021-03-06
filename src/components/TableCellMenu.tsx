import { useEvents, usePositioner } from '@remirror/react-hooks';
import React, { useState } from 'react';
import { cellPositioner } from '../block-positioner';
import { borderWidth } from '../const';

export type TableCellMenuButtonProps = {
  setPopupOpen: (open: boolean) => void;
};
export type TableCellMenuButton = React.ComponentType<TableCellMenuButtonProps>;

export const DefaultTableCellMenuButton: React.FC<TableCellMenuButtonProps> = ({ setPopupOpen }) => {
  return (
    <button onClick={() => setPopupOpen(true)} style={{ position: 'relative', left: '-8px', top: '8px' }}>
      v
    </button>
  );
};

export type TableCellMenuPapperProps = Record<string, never>;
export type TableCellMenuPopup = React.ComponentType<TableCellMenuPapperProps>;

export const DefaultTableCellMenuPopup: React.FC<TableCellMenuPapperProps> = () => {
  return <div style={{ position: 'absolute', backgroundColor: 'white', border: '1px solid red' }}>MENU</div>;
};

export type TableCellMenuProps = { Button?: TableCellMenuButton; Popup?: TableCellMenuPopup };

const TableCellMenu: React.FC<TableCellMenuProps> = ({ Button = DefaultTableCellMenuButton, Popup = DefaultTableCellMenuPopup }) => {
  const position = usePositioner(cellPositioner, []);
  const { ref, width, height, x, y } = position;

  const [popupOpen, setPopupOpen] = useState(false);

  console.log('popupOpen:', popupOpen);

  useEvents('mousedown', () => {
    popupOpen && setPopupOpen(false);
    return false;
  });

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: width + borderWidth,
        height: height + 1,
        minHeight: 40,
        minWidth: 40,
        zIndex: 0,
        pointerEvents: 'none',

        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'flex-start',

        // for debug:
        // backgroundColor: 'lightpink',
        // opacity: 0.5,
      }}
    >
      <div style={{ pointerEvents: 'initial' }}>
        <Button setPopupOpen={setPopupOpen} />
        {popupOpen && <Popup />}
      </div>
    </div>
  );
};

export { TableCellMenu };
export default TableCellMenu;
