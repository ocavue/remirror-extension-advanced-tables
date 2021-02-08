import { EditorView } from '@remirror/core';
import { Node as ProsemirrorNode } from '@remirror/pm/model';
import { Decoration } from '@remirror/pm/view';
import React from 'jsx-dom';
import { ControllerType } from '../const';
import TableInsertionTriggerAreas from '../controller/TableInsertionTriggerAreas';
import { stopEvent } from '../utils/dom';
import { DOM } from '../utils/jsx';

const TableControllerCell = ({
  node,
  view,
  getPos,
  decorations,
  setContentDOM,
  setDOM,
}: {
  node: ProsemirrorNode;
  view: EditorView;
  getPos: () => number;
  decorations: Decoration[];
  setContentDOM: (contentDOM: DOM) => void;
  setDOM: (dom: DOM) => void;
}) => {
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

  let button = <button className='remirror-table-controller__add-column-button'>a</button>;

  let contentDOM = <div contentEditable={false} />;
  let wrapper = (
    <div contentEditable={false} className='remirror-table-controller__add-column-wrapper'>
      <TableInsertionTriggerAreas controllerType={controllerType} />
      {contentDOM}
      {button}
      {mark}
    </div>
  );

  let th = (
    <th contentEditable={false} className={'remirror-table-controller ' + className} {...node.attrs.events}>
      {wrapper}
    </th>
  );

  setContentDOM(contentDOM);
  setDOM(th);

  return th;
};

export default TableControllerCell;
