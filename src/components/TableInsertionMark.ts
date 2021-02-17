import { css } from '@emotion/css';
import { h } from 'jsx-dom/min';
import { ControllerType } from '../const';

const TableInsertionMark = ({
  controllerType,
  markWidth = 4,
  color = 'rgba(145, 145, 145, 0.589)',
}: {
  controllerType: ControllerType;
  markWidth?: number;
  color?: string;
}): HTMLElement[] => {
  const result: HTMLElement[] = [];
  if (controllerType === ControllerType.ROW_CONTROLLER || controllerType === ControllerType.CORNER_CONTROLLER) {
    result.push(
      h('div', {
        className: css`
          position: absolute;
          bottom: -${0.5 * markWidth}px;
          left: -12px;

          width: 0px;
          height: 0px;
          border-radius: 50%;
          border-style: solid;
          border-color: ${color};
          border-width: ${0.5 * markWidth}px;
        `,
      }),
    );
  }
  if (controllerType === ControllerType.COLUMN_CONTROLLER || controllerType === ControllerType.CORNER_CONTROLLER) {
    result.push(
      h('div', {
        className: css`
          position: absolute;
          right: -${0.5 * markWidth}px;
          top: -12px;

          width: 0px;
          height: 0px;
          border-radius: 50%;
          border-style: solid;
          border-color: ${color};
          border-width: ${0.5 * markWidth}px;
        `,
      }),
    );
  }
  return result;
};

export default TableInsertionMark;
