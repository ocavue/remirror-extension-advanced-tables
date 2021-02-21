import { css, cx } from '@emotion/css';
import { EditorView, throttle } from '@remirror/core';
import { addColumn, addRow, TableRect } from '@remirror/pm/tables';
import { h } from 'jsx-dom/min';
import { TableNodeAttrs } from '../table-extension';
import { setNodeAttrs } from '../utils/prosemirror';
import { controllerAutoHide } from '../utils/style';

type MouseMoveListener = (e: MouseEvent) => void;
const mouseMoveListeners: MouseMoveListener[] = [];

export type InsertionButtonAttrs = {
  // The center axis (in px) of the TableInsertionButton
  x: number;
  y: number;

  // The rectangle axis (in px) of the TableInsertionButtonTrigger
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

function InnerTableInsertionButton(attrs: InsertionButtonAttrs): HTMLElement {
  let size = 24;

  let className = css`
    position: fixed;
    width: ${size}px;
    height: ${size}px;
    top: ${attrs.y - size / 2}px;
    left: ${attrs.x - size / 2}px;
    zindex: 105;
  `;

  return h(
    'button',
    {
      className: cx(className, controllerAutoHide),
    },
    '+',
  );
}

function TableInsertionButton({ view, tableRect, attrs }: TableInsertionButtonProps): HTMLElement {
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

    // Remove insertionButtonAttrs from tableNode so that the TableInsertionButton won't keep at the origin position.
    let attrsPatch: Partial<TableNodeAttrs> = { insertionButtonAttrs: null };
    tr = setNodeAttrs(tr, tableRect.tableStart - 1, attrsPatch);

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

  let handleMouseMove = throttle(100, (e: MouseEvent) => {
    console.log('onMouseMove ', mouseMoveListeners.length, 'attrs:', attrs);

    if (
      (attrs.col !== -1 &&
        (e.clientX < attrs.triggerMinX - 400 ||
          e.clientX > attrs.triggerMaxX + 400 ||
          e.clientY < attrs.triggerMinY - 60 ||
          e.clientY > attrs.triggerMaxY)) ||
      (attrs.row !== -1 &&
        (e.clientY < attrs.triggerMinY - 100 ||
          e.clientY > attrs.triggerMaxY + 100 ||
          e.clientX < attrs.triggerMinX - 40 ||
          e.clientX > attrs.triggerMaxX))
    ) {
      while (mouseMoveListeners.length) {
        document.removeEventListener('mousemove', mouseMoveListeners.pop() as MouseMoveListener);
      }
      button.style.display = 'none';
    }
  });

  if (mouseMoveListeners.length === 0) {
    mouseMoveListeners.push(handleMouseMove);
    document.addEventListener('mousemove', handleMouseMove);
  }

  return button;
}

export default TableInsertionButton;
