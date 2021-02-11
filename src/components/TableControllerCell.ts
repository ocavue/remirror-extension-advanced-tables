import { EditorView, findParentNodeOfType, FindProsemirrorNodeResult } from '@remirror/core';
import { Node as ProsemirrorNode } from '@remirror/pm/model';
import { Decoration } from '@remirror/pm/view';
import { h } from 'jsx-dom/min';
import { TableMap } from 'prosemirror-tables';
import { ControllerType } from '../const';
import { newControllerEvents, getControllerType } from '../utils/controller';
import { CellAxis } from '../utils/types';
import TableInsertionButtonTrigger from './TableInsertionButtonTrigger';
import TableInsertionMark from './TableInsertionMark';

export type TableControllerCellProps = {
  node: ProsemirrorNode;
  view: EditorView;
  getPos: () => number;
  decorations: Decoration[];
  contentDOM: HTMLElement;
};

let classNameMap = {
  [ControllerType.ROW_CONTROLLER]: 'remirror-table-row-controller',
  [ControllerType.COLUMN_CONTROLLER]: 'remirror-table-column-controller',
  [ControllerType.CORNER_CONTROLLER]: 'remirror-table-corner-controller',
};

const TableControllerCell = ({ node, view, getPos, decorations, contentDOM }: TableControllerCellProps) => {
  const getAxis = (): CellAxis => {
    let $pos = view.state.doc.resolve(getPos() + 1);
    return { col: $pos.index(-1), row: $pos.index(-2) };
  };

  let controllerType = getControllerType(getAxis());
  let className = classNameMap[controllerType];

  const findTable = (): FindProsemirrorNodeResult | undefined => {
    return findParentNodeOfType({
      types: 'table',
      selection: view.state.doc.resolve(getPos()),
    });
  };

  const wrapper = h(
    'div',
    { contentEditable: false, className: 'remirror-table-controller__add-column-wrapper' },
    contentDOM,
    ...TableInsertionButtonTrigger({ controllerType, view, findTable, getAxis }),
    TableInsertionMark(),
  );

  let events = newControllerEvents({
    controllerType,
    view,
    getAxis,
    getTablePos: () => {
      return findTable()!.pos; // TODO: perf
    },
    getMap: () => {
      return TableMap.get(findTable()!.node);
    },
  });

  const td = h('td', { contentEditable: false, className: 'remirror-table-controller ' + className, ...events }, wrapper);

  return td;
};

export default TableControllerCell;
