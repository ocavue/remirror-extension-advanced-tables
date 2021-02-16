import { EditorView, ProsemirrorNode } from '@remirror/core';
import { h } from 'jsx-dom/min';
import { TableNodeAttrs } from '../table-extension';
import { CellSelectionType } from '../utils/controller';

function TableDeleteButton({ view, node }: { view: EditorView; node: ProsemirrorNode }): HTMLElement | void {
  let attrs = node.attrs as TableNodeAttrs;

  if (attrs.selectionType === CellSelectionType.row) {
    return h('button', { style: { backgroundColor: 'red' } }, 'aaaaa');
  } else if (attrs.selectionType === CellSelectionType.col) {
    return h('button', { style: { backgroundColor: 'blue' } }, 'aaaaa');
  }

  return;
}

export default TableDeleteButton;
