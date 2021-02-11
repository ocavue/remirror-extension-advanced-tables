import { EditorView, throttle } from '@remirror/core';
import { addColumn, addRow, TableRect } from '@remirror/pm/tables';
import { h } from 'jsx-dom/min';

type MouseMoveListener = (e: MouseEvent) => void;
const mouseMoveListeners: MouseMoveListener[] = [];

export type InsertionButtonAttrs = {
  // The center axis of the TableInsertionButton
  x: number;
  y: number;

  // The rectangle axis of the TableInsertionButtonTrigger
  triggerMinX: number;
  triggerMinY: number;
  triggerMaxX: number;
  triggerMaxY: number;

  // If `row` is not `-1`, this button will add a row at this index.
  row: number;
  // If `col` is not `-1`, this button will add a col at this index.
  col: number;
};

export type TableInsertionButtonProps = {
  view: EditorView;
  tableRect: TableRect;
  attrs: InsertionButtonAttrs;
};

function InnerTableInsertionButton(attrs: InsertionButtonAttrs) {
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
    },
    '+',
  );
}

function TableInsertionButton({ view, tableRect, attrs }: TableInsertionButtonProps) {
  let button = InnerTableInsertionButton(attrs);

  const insertRolOrColumn = () => {
    let tr = view.state.tr;
    if (attrs.col !== -1) {
      tr = addColumn(tr, tableRect, attrs.col);
    } else if (attrs.row !== -1) {
      tr = addRow(tr, tableRect, attrs.row);
    } else {
      return;
    }
    view.dispatch(tr);
  };

  // TODO: onMouseDown work but onClick doesn't work.
  button.onclick = (e) => {
    console.debug('[TableInsertionButton] onClick', attrs);
  };
  button.onmousedown = (e) => {
    console.debug('[TableInsertionButton] onMouseDown', attrs);
    insertRolOrColumn();
  };

  let onMouseMove = throttle(100, (e: MouseEvent) => {
    if (
      e.clientX < attrs.triggerMinX - 400 ||
      e.clientX > attrs.triggerMaxX + 400 ||
      e.clientY < attrs.triggerMinY - 60 ||
      e.clientY > attrs.triggerMaxY
    ) {
      while (mouseMoveListeners.length) {
        document.removeEventListener('mousemove', mouseMoveListeners.pop() as MouseMoveListener);
      }
      button.style.display = 'none';
    }
  });

  mouseMoveListeners.push(onMouseMove);
  document.addEventListener('mousemove', onMouseMove);

  return button;
}

export default TableInsertionButton;
