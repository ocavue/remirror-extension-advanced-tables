import { FindProsemirrorNodeResult } from '@remirror/core';
import { EditorView } from '@remirror/pm';
import console from 'console';
import { CSSProperties, h } from 'jsx-dom/min';
import { ControllerType } from '../const';
import type { TableNodeAttrs } from '../table-extension';

type TableInsertionTriggerArea = 'left' | 'right';

const TableInsertionTriggerArea = ({
  type,
  view,
  getTable,
}: {
  type: TableInsertionTriggerArea;
  view: EditorView;
  getTable: () => FindProsemirrorNodeResult;
}) => {
  let showButtonTriggerAreaStyle: CSSProperties = {
    flex: 1,
    height: '24px',
    position: 'relative',
    zIndex: 12,

    // Just for debug. Use linear-gradient as background so that we can differentiate two neighbor areas.
    background: 'linear-gradient(to left top, rgba(0, 255, 100, 0.3), rgba(200, 100, 255, 0.3))',
  };

  // let buttonStyle: CSSProperties = {
  //   display: 'none',
  //   zIndex: 105,

  //   position: 'absolute',
  //   width: '24px',
  //   height: '24px',
  //   top: '-16px',

  //   opacity: 1,
  // };

  // if (type === 'left') buttonStyle.left = '-12px';
  // if (type === 'right') buttonStyle.right = '-13px';

  // let button = h('button', { style: buttonStyle }, 'a');

  const showButton = () => {
    console.debug('showButton');

    let rect = area?.getClientRects()[0];
    console.debug('get size async', rect);
    if (!rect) return;

    if (!rect.width && !rect.bottom) return;

    let insertionButtonAttrs = { x: 0, y: 0 };
    if (type === 'left') {
      insertionButtonAttrs = { x: rect.x, y: rect.y };
    } else if (type === 'right') {
      insertionButtonAttrs = { x: rect.x + rect.width, y: rect.y + rect.height };
    }

    let tableResult = getTable();
    let attrs: TableNodeAttrs = { ...(tableResult.node.attrs as TableNodeAttrs), insertionButtonAttrs };
    view.dispatch(view.state.tr.setNodeMarkup(tableResult.pos, undefined, attrs));
  };
  const hideButton = () => {
    console.debug('hideButton');

    let tableResult = getTable();
    let attrs: TableNodeAttrs = { ...(tableResult.node.attrs as TableNodeAttrs), insertionButtonAttrs: null };
    view.dispatch(view.state.tr.setNodeMarkup(tableResult.pos, undefined, attrs));
  };

  let area = h('div', { style: showButtonTriggerAreaStyle, onMouseLeave: hideButton, onMouseEnter: showButton });

  return area;
};

const TableInsertionTriggerAreas = ({
  controllerType,
  view,
  getTable,
}: {
  controllerType: ControllerType;
  view: EditorView;
  getTable: () => FindProsemirrorNodeResult;
}) => {
  if (controllerType == ControllerType.COLUMN_CONTROLLER) {
    return [TableInsertionTriggerArea({ type: 'left', view, getTable }), TableInsertionTriggerArea({ type: 'right', view, getTable })];
  }
  return [];
};

const TableInsertionButtonWrapper = (props: {
  controllerType: ControllerType;
  view: EditorView;
  getTable: () => FindProsemirrorNodeResult;
}) => {
  return TableInsertionTriggerAreas(props);
};

export default TableInsertionButtonWrapper;
