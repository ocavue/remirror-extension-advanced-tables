import { EditorView } from '@remirror/pm';
import { CSSProperties, h } from 'jsx-dom/min';
import { ControllerType } from '../const';
import type { TableNodeAttrs } from '../table-extension';
import { CellAxis, FindTable } from '../utils/types';
import { InsertionButtonAttrs } from './TableInsertionButton';

type TriggerAreaType = 'add_column_left' | 'add_column_right' | 'add_row_up' | 'add_row_buttom';

const borderWidth = 1; // We could change it to a paramter instead of a constant if we want to support more border width values.

function buildInsertionButtonAttrs(type: TriggerAreaType, rect: DOMRect, cellAxis: CellAxis): InsertionButtonAttrs {
  let { col } = cellAxis;

  let attrs = {
    triggerMinX: rect.x,
    triggerMinY: rect.y,
    triggerMaxX: rect.x + rect.width,
    triggerMaxY: rect.y + rect.height,
  };
  if (type === 'add_column_left') {
    return {
      ...attrs,
      x: rect.x,
      y: rect.y,

      row: -1,
      col: col - 1,
    };
  } else {
    return {
      ...attrs,
      x: rect.x + rect.width + borderWidth,
      y: rect.y,

      row: -1,
      col: col,
    };
  }
}

const TriggerArea = ({
  type,
  view,
  findTable,
  cellAxis,
}: {
  type: TriggerAreaType;
  view: EditorView;
  findTable: FindTable;
  cellAxis: CellAxis;
}) => {
  let style: CSSProperties = {
    flex: 1,
    height: '24px',
    position: 'relative',
    zIndex: 12,

    // Just for debug. Use linear-gradient as background so that we can differentiate two neighbor areas.
    // background: 'linear-gradient(to left top, rgba(0, 255, 100, 0.3), rgba(200, 100, 255, 0.3))',
  };

  const showButton = () => {
    let rect = area?.getClientRects()[0];
    if (!rect) return;
    if (!rect.width && !rect.height) return;

    let tableResult = findTable();
    if (!tableResult) return;
    let insertionButtonAttrs = buildInsertionButtonAttrs(type, rect, cellAxis);
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
  cellAxis,
}: {
  controllerType: ControllerType;
  view: EditorView;
  findTable: FindTable;
  cellAxis: CellAxis;
}) => {
  if (controllerType == ControllerType.COLUMN_CONTROLLER) {
    return [
      TriggerArea({ type: 'add_column_left', view, findTable, cellAxis }),
      TriggerArea({ type: 'add_column_right', view, findTable, cellAxis }),
    ];
  }
  return [];
};

export default TableInsertionButtonTrigger;
