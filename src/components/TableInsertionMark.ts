import { h } from 'jsx-dom/min';
import { ControllerType } from '../const';

let addRowMarkAttrs = { className: 'remirror-table-controller__add_row_mark' };
let addColumnMarkAttrs = { className: 'remirror-table-controller__add_column_mark' };

const TableInsertionMark = ({ controllerType }: { controllerType: ControllerType }) => {
  if (controllerType === ControllerType.ROW_CONTROLLER) return [h('div', addRowMarkAttrs)];
  if (controllerType === ControllerType.COLUMN_CONTROLLER) return [h('div', addColumnMarkAttrs)];
  return [h('div', addRowMarkAttrs), h('div', addColumnMarkAttrs)];
};

export default TableInsertionMark;
