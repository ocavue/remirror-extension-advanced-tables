import { EditorView, findParentNodeOfType, FindProsemirrorNodeResult } from '@remirror/core';
import { Node as ProsemirrorNode } from '@remirror/pm/model';
import { Decoration } from '@remirror/pm/view';
import { ControllerType } from '../const';
import TableInsertionButtonTrigger from './TableInsertionButtonTrigger';
import { h } from 'jsx-dom/min';
import TableInsertionMark from './TableInsertionMark';
import { TableControllerCellAttrs } from '../table-extension';

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

  let wrapper = h(
    'div',
    { contentEditable: false, className: 'remirror-table-controller__add-column-wrapper' },
    contentDOM,
    ...TableInsertionButtonTrigger({ controllerType, view, findTable }),
    TableInsertionMark(),
  );

  return h('td', { contentEditable: false, className: 'remirror-table-controller ' + className, ...attrs.events }, wrapper);
};

export default TableControllerCell;
