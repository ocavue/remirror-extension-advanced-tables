import { throttle } from '@remirror/core';
import { h } from 'jsx-dom/min';

export type InsertionButtonAttrs = {
  // The center axis of the TableInsertionButton
  x: number;
  y: number;

  // The rectangle axis of the TableInsertionButtonTrigger
  triggerMinX: number;
  triggerMinY: number;
  triggerMaxX: number;
  triggerMaxY: number;
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
    if (
      e.clientX < attrs.triggerMinX - 400 ||
      e.clientX > attrs.triggerMaxX + 400 ||
      e.clientY < attrs.triggerMinY - 60 ||
      e.clientY > attrs.triggerMaxY
    ) {
      document.removeEventListener('mousemove', onMouseMove);
      button.style.display = 'none';
    }
  });

  document.addEventListener('mousemove', onMouseMove);

  return button;
}

export default TableInsertionButton;
