import { throttle } from '@remirror/core';
import { h } from 'jsx-dom/min';

export type InsertionButtonAttrs = {
  // The center axis of the InsertionButton
  x: number;
  y: number;
};

function TableInsertionButton(attrs: InsertionButtonAttrs) {
  let size = 24;

  let button = h(
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
      onClick: (e) => {
        // TODO: insert column
        // TODO: fouce column
      },
    },
    '+',
  );

  let onMouseMove = throttle(100, (e: MouseEvent) => {
    // TODO: add move information in InsertionButtonAttrs
    if (e.clientX < attrs.x - 300 || e.clientX > attrs.x + 300 || e.clientY < attrs.y - 60 || e.clientY > attrs.y + 24) {
      document.removeEventListener('mousemove', onMouseMove);
      button.style.display = 'none';
    }
  });

  document.addEventListener('mousemove', onMouseMove);

  return button;
}

export default TableInsertionButton;
