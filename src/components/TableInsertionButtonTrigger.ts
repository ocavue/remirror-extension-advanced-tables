import { EditorView } from '@remirror/pm';
import { CSSProperties, h } from 'jsx-dom/min';
import { borderWidth, ControllerType } from '../const';
import type { TableNodeAttrs } from '../table-extension';
import { CellAxis, FindTable } from '../utils/types';
import { InsertionButtonAttrs } from './TableInsertionButton';

type TriggerAreaType = 'add_column_left' | 'add_column_right' | 'add_row_up' | 'add_row_buttom'; // TODO: use enum

function buildInsertionButtonAttrs(type: TriggerAreaType, rect: DOMRect, cellAxis: CellAxis): InsertionButtonAttrs {
  let { row, col } = cellAxis;

  let attrs = {
    triggerMinX: rect.x,
    triggerMinY: rect.y,
    triggerMaxX: rect.x + rect.width,
    triggerMaxY: rect.y + rect.height,
  };
  if (type === 'add_column_left') {
    return {
      ...attrs,
      x: rect.x - borderWidth,
      y: rect.y,

      row: -1,
      col: col,
    };
  } else if (type === 'add_column_right') {
    return {
      ...attrs,
      x: rect.x + rect.width,
      y: rect.y,

      row: -1,
      col: col + 1,
    };
  } else if (type === 'add_row_up') {
    return {
      ...attrs,
      x: rect.x,
      y: rect.y - borderWidth,

      row: row,
      col: -1,
    };
  } else {
    return {
      ...attrs,
      x: rect.x,
      y: rect.y + rect.height,

      row: row + 1,
      col: -1,
    };
  }
}

const TriggerArea = ({
  type,
  view,
  findTable,
  getAxis,
}: {
  type: TriggerAreaType;
  view: EditorView;
  findTable: FindTable;
  getAxis: () => CellAxis;
}) => {
  let style: CSSProperties = {
    flex: 1,
    position: 'relative',
    zIndex: 12,

    // Just for debug. Use linear-gradient as background so that we can differentiate two neighbor areas.
    // background: 'linear-gradient(to left top, rgba(0, 255, 100, 0.3), rgba(200, 100, 255, 0.3))',
  };

  if (type === 'add_column_left' || type === 'add_column_right') style.height = '24px';
  else if (type === 'add_row_up' || type === 'add_row_buttom') style.width = '24px';

  const showButton = () => {
    let rect = area?.getClientRects()[0];
    if (!rect) return;
    if (!rect.width && !rect.height) return;

    let tableResult = findTable();
    if (!tableResult) return;
    let insertionButtonAttrs = buildInsertionButtonAttrs(type, rect, getAxis());
    let attrs: TableNodeAttrs = { ...(tableResult.node.attrs as TableNodeAttrs), insertionButtonAttrs };
    view.dispatch(view.state.tr.setNodeMarkup(tableResult.pos, undefined, attrs));
  };

  let area = h('div', { style, onMouseEnter: showButton });

  return area;
};

const TableInsertionButtonTrigger = ({
  controllerType,
  view,
  findTable,
  getAxis,
}: {
  controllerType: ControllerType;
  view: EditorView;
  findTable: FindTable;
  getAxis: () => CellAxis;
}) => {
  if (controllerType == ControllerType.COLUMN_CONTROLLER) {
    return [
      TriggerArea({ type: 'add_column_left', view, findTable, getAxis }),
      TriggerArea({ type: 'add_column_right', view, findTable, getAxis }),
    ];
  } else if (controllerType == ControllerType.ROW_CONTROLLER) {
    return [
      TriggerArea({ type: 'add_row_up', view, findTable, getAxis }),
      TriggerArea({ type: 'add_row_buttom', view, findTable, getAxis }),
    ];
  }
  return [];
};

export default TableInsertionButtonTrigger;
