import { EditorView, findParentNodeOfType, FindProsemirrorNodeResult } from '@remirror/core';
import { Node as ProsemirrorNode } from '@remirror/pm/model';
import { Decoration } from '@remirror/pm/view';
import { h } from 'jsx-dom/min';
import { ControllerType } from '../const';
import { TableControllerCellAttrs } from '../table-extension';
import TableInsertionButtonTrigger from './TableInsertionButtonTrigger';
import TableInsertionMark from './TableInsertionMark';

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

  let attrs = node.attrs as TableControllerCellAttrs;

  console.debug('TableControllerCell attrs', 'colspan:', attrs.colspan, 'rowspan:', attrs.rowspan);

  const findTable = (): FindProsemirrorNodeResult | undefined => {
    return findParentNodeOfType({
      types: 'table',
      selection: view.state.doc.resolve(getPos()),
    });
  };

  const findTableCellIndex = (): { row: number; col: number } => {
    let row = -1;
    let col = -1;

    let tr = td.parentElement;
    if (!tr) return { row, col };
    let tbody = tr.parentElement;
    if (!tbody) return { row, col };

    row = Array.prototype.indexOf.call(tbody.children, tr);
    col = Array.prototype.indexOf.call(tr.children, td);

    return { row, col };
  };

  const wrapper = h(
    'div',
    { contentEditable: false, className: 'remirror-table-controller__add-column-wrapper' },
    contentDOM,
    ...TableInsertionButtonTrigger({ controllerType, view, findTable, findTableCellIndex }),
    TableInsertionMark(),
  );

  const td = h('td', { contentEditable: false, className: 'remirror-table-controller ' + className, ...attrs.events }, wrapper);

  return td;
};

export default TableControllerCell;
