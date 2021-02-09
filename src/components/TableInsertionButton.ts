import { h } from 'jsx-dom/min';

export type InsertionButtonAttrs = {
  // The center axis of the InsertionButton
  x: number;
  y: number;
};

function TableInsertionButton(attrs: InsertionButtonAttrs) {
  let size = 24;

  return h(
    'button',
    {
      style: {
        position: 'fixed',
        width: `${size}px`,
        height: `${size}px`,
        top: `${attrs.y - size / 2}px`,
        left: `${attrs.x - size / 2}px`,
        zIndex: 105,
      },
      onClick: () => {
        console.log(attrs);
      },
    },
    '+',
  );
}

export default TableInsertionButton;
