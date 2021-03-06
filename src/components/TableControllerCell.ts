import { css, cx } from '@emotion/css';
import { EditorView, findParentNodeOfType, FindProsemirrorNodeResult } from '@remirror/core';
import { Node as ProsemirrorNode } from '@remirror/pm/model';
import { Decoration } from '@remirror/pm/view';
import { h } from 'jsx-dom/min';
import { ClassName, ControllerType } from '../const';
import { getCellAxis, getControllerType, newControllerEvents } from '../utils/controller';
import { CellAxis } from '../utils/types';
import TableInsertionButtonTrigger from './TableInsertionButtonTrigger';
import TableInsertionMark from './TableInsertionMark';
import { controllerAutoHide } from '../utils/style';

export type TableControllerCellProps = {
  node: ProsemirrorNode;
  view: EditorView;
  getPos: () => number;
  decorations: Decoration[];
  contentDOM: HTMLElement;
};

const TableControllerCell = ({ node, view, getPos, decorations, contentDOM }: TableControllerCellProps) => {
  const getAxis = (): CellAxis => {
    return getCellAxis(view.state.doc.resolve(getPos() + 1));
  };

  let controllerType = getControllerType(getAxis());

  let controllerWrapperClass = '';

  // TODO: use css selector instead of js to detect ControllerType
  if (controllerType === ControllerType.ROW_CONTROLLER) {
    controllerWrapperClass = css`
      height: 100%;
      overflow: visible;

      position: relative;

      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      align-items: flex-end;
    `;
  } else if (controllerType === ControllerType.COLUMN_CONTROLLER) {
    controllerWrapperClass = css`
      width: 100%;
      overflow: visible;

      position: relative;

      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      align-items: flex-end;
    `;
  }

  const findTable = (): FindProsemirrorNodeResult | undefined => {
    return findParentNodeOfType({
      types: 'table',
      selection: view.state.doc.resolve(getPos()),
    });
  };

  const baseClass = css`
    padding: 0;
    overflow: visible;
    cursor: pointer;
    z-index: 101;
  `;

  // TODO: controllerType maybe wrong
  const events = newControllerEvents({ controllerType, view, getAxis, findTable });

  const wrapper = h(
    'div',
    { contentEditable: 'false', className: controllerWrapperClass },
    contentDOM,
    ...TableInsertionButtonTrigger({ controllerType, view, findTable, getAxis }),
    ...TableInsertionMark({ controllerType }),
  );

  return h(
    'th',
    { contentEditable: 'false', className: cx(ClassName.TABLE_CONTROLLER, baseClass, controllerAutoHide), ...events },
    wrapper,
  );
};

export default TableControllerCell;
