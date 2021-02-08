import React from 'jsx-dom';

import { EditorView } from '@remirror/core';
import { Node as ProsemirrorNode } from '@remirror/pm/model';
import { Decoration } from '@remirror/pm/view';
import { ControllerType } from '../const';
import TableInsertionTriggerAreas from '../controller/TableInsertionTriggerAreas';
import { stopEvent } from '../utils/dom';
import { DOM } from '../utils/jsx';

export type TableControllerCellProps = {
  node: ProsemirrorNode;
  view: EditorView;
  getPos: () => number;
  decorations: Decoration[];
  contentDOM: DOM;
};

const TableControllerCell = ({ node, view, getPos, decorations, contentDOM }: TableControllerCellProps) => {
  const controllerType = node.attrs.controllerType;

  let className = '';
  if (controllerType === ControllerType.ROW_CONTROLLER) className = 'remirror-table-row-controller';
  else if (controllerType === ControllerType.COLUMN_CONTROLLER) className = 'remirror-table-column-controller';
  else if (controllerType === ControllerType.CORNER_CONTROLLER) className = 'remirror-table-corner-controller';

  let mark = (
    <div
      className='remirror-table-controller__add-column-mark'
      /* prevent the parent (.remirror-table-controller) preview selection hightlight. */
      onMouseOver={stopEvent}
      onMouseOut={stopEvent}
    />
  );

  let button = (
    <button className='remirror-table-controller__add-column-button' style={{ display: 'none' }}>
      a
    </button>
  );

  const showButton = () => {
    console.debug('showButton');
    button.style.setProperty('display', 'inherit');
  };
  const hideButton = () => {
    console.debug('hideButton');
    button.style.setProperty('display', 'none');
  };

  let wrapper = (
    <div contentEditable={false} className='remirror-table-controller__add-column-wrapper'>
      <TableInsertionTriggerAreas controllerType={controllerType} showButton={showButton} hideButton={hideButton} />
      {contentDOM}
      {button}
      {mark}
    </div>
  );

  return (
    <th contentEditable={false} className={'remirror-table-controller ' + className} {...node.attrs.events}>
      {wrapper}
    </th>
  );
};

export default TableControllerCell;
