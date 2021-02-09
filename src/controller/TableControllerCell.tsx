import { EditorView } from '@remirror/core';
import { Node as ProsemirrorNode } from '@remirror/pm/model';
import { Decoration } from '@remirror/pm/view';
import { ControllerType } from '../const';
import TableInsertionButtonWrapper from './TableInsertionButtonWrapper';
import { stopEvent } from '../utils/dom';
import { h } from 'jsx-dom/min';

export type TableControllerCellProps = {
  node: ProsemirrorNode;
  view: EditorView;
  getPos: () => number;
  decorations: Decoration[];
  contentDOM: HTMLElement;
};

const TableControllerCell = ({ node, view, getPos, decorations, contentDOM }: TableControllerCellProps) => {
  const controllerType = node.attrs.controllerType;

  let className = '';
  if (controllerType === ControllerType.ROW_CONTROLLER) className = 'remirror-table-row-controller';
  else if (controllerType === ControllerType.COLUMN_CONTROLLER) className = 'remirror-table-column-controller';
  else if (controllerType === ControllerType.CORNER_CONTROLLER) className = 'remirror-table-corner-controller';

  let mark = h('div', {
    className: 'remirror-table-controller__add-column-mark',
    /* prevent the parent (.remirror-table-controller) preview selection hightlight. */
    onMouseOver: stopEvent,
    onMouseOut: stopEvent,
  });

  let wrapper = h(
    'div',
    { contentEditable: false, className: 'remirror-table-controller__add-column-wrapper' },
    ...TableInsertionButtonWrapper({ controllerType }),
    contentDOM,
    mark,
  );

  return h('td', { contentEditable: false, className: 'remirror-table-controller ' + className, ...node.attrs.events }, wrapper);
};

export default TableControllerCell;
