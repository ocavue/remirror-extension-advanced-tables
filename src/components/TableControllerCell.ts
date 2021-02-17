import { css } from '@emotion/css';
import { EditorView, findParentNodeOfType, FindProsemirrorNodeResult } from '@remirror/core';
import { Node as ProsemirrorNode } from '@remirror/pm/model';
import { Decoration } from '@remirror/pm/view';
import { h } from 'jsx-dom/min';
import { ControllerType } from '../const';
import { getCellAxis, getControllerType, newControllerEvents } from '../utils/controller';
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

const TableControllerCell = ({ node, view, getPos, decorations, contentDOM }: TableControllerCellProps) => {
  const getAxis = (): CellAxis => {
    return getCellAxis(view.state.doc.resolve(getPos() + 1));
  };

  let controllerType = getControllerType(getAxis());

  let controllerClass = '';
  if (controllerType === ControllerType.ROW_CONTROLLER) {
    controllerClass = css`
      overflow: visible;
      & .remirror-table-controller__wrapper {
        height: 100%;
        overflow: visible;

        position: relative;

        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        align-items: flex-end;
        z-index: 101;
      }
    `;
  } else if (controllerType === ControllerType.COLUMN_CONTROLLER) {
    controllerClass = css`
      overflow: visible;
      & .remirror-table-controller__wrapper {
        width: 100%;
        overflow: visible;

        position: relative;

        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        align-items: flex-end;
        z-index: 101;
      }
    `;
  } else if (controllerType === ControllerType.CORNER_CONTROLLER) {
    controllerClass = css`
      overflow: visible;
      & .remirror-table-controller__wrapper {
        overflow: visible;
      }
    `;
  }

  const findTable = (): FindProsemirrorNodeResult | undefined => {
    return findParentNodeOfType({
      types: 'table',
      selection: view.state.doc.resolve(getPos()),
    });
  };

  const events = newControllerEvents({ controllerType, view, getAxis, findTable });

  const wrapper = h(
    'div',
    { contentEditable: 'false', className: 'remirror-table-controller__wrapper' },
    contentDOM,
    ...TableInsertionButtonTrigger({ controllerType, view, findTable, getAxis }),
    ...TableInsertionMark({ controllerType }),
  );

  return h('td', { contentEditable: 'false', className: 'remirror-table-controller ' + controllerClass, ...events }, wrapper);
};

export default TableControllerCell;
