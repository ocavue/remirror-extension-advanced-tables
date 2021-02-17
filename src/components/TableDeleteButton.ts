import { EditorView, ProsemirrorNode } from '@remirror/core';
import { h } from 'jsx-dom/min';
import { deleteColumn, deleteRow } from 'prosemirror-tables';
import { CellSelectionType } from '../utils/controller';

export type DeleteButtonAttrs = {
  selectionType: CellSelectionType;
  selectionHeadCellPos: number;
  selectionAnchorCellPos: number;
};

function InnerTableDeleteButton({
  minX,
  minY,
  maxX,
  maxY,
  selectionType,
}: {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  selectionType: CellSelectionType;
}): HTMLElement {
  const size = 24;
  const gap = 24;

  let x: number, y: number;
  if (selectionType === CellSelectionType.row) {
    x = minX - size / 2 - gap;
    y = (minY + maxY) / 2 - size / 2;
  } else {
    x = (minX + maxX) / 2 - size / 2;
    y = minY - size / 2 - gap;
  }

  return h(
    'button',
    {
      style: {
        backgroundColor: 'lightpink',
        position: 'fixed',
        left: `${x}px`,
        top: `${y}px`,
        width: `${size}px`,
        height: `${size}px`,
        zIndex: 106,
      },
    },
    'x',
  );
}

function TableDeleteButton({
  view,
  node,
  attrs,
}: {
  view: EditorView;
  node: ProsemirrorNode;
  attrs: DeleteButtonAttrs;
}): HTMLElement | void {
  if (attrs.selectionType !== CellSelectionType.col && attrs.selectionType !== CellSelectionType.row) return;

  let anchorCellDOM = view.nodeDOM(attrs.selectionAnchorCellPos) as HTMLElement | null | undefined;
  let headCellDOM = view.nodeDOM(attrs.selectionHeadCellPos) as HTMLElement | null | undefined;
  if (!anchorCellDOM || !headCellDOM) return;

  let anchorCellRect = anchorCellDOM.getBoundingClientRect();
  let headCellRect = headCellDOM.getBoundingClientRect();

  let minX = Math.min(anchorCellRect.x, headCellRect.x);
  let minY = Math.min(anchorCellRect.y, headCellRect.y);
  let maxX = Math.max(anchorCellRect.x + anchorCellRect.width, headCellRect.x + headCellRect.width);
  let maxY = Math.max(anchorCellRect.y + anchorCellRect.height, headCellRect.y + headCellRect.height);

  const deleteRowOrColumn = () => {
    if (attrs.selectionType === CellSelectionType.row) {
      deleteRow(view.state, view.dispatch);
    } else {
      deleteColumn(view.state, view.dispatch);
    }
    view.dispatch(view.state.tr.deleteSelection());
  };

  let button = InnerTableDeleteButton({
    minX,
    minY,
    maxX,
    maxY,
    selectionType: attrs.selectionType,
  });

  button.onmousedown = deleteRowOrColumn;

  return button;
}

export default TableDeleteButton;
