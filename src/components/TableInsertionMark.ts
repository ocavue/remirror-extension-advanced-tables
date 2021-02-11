import { h } from 'jsx-dom/min';
import { stopEvent } from '../utils/dom';

const TableInsertionMark = () => {
  return h('div', {
    className: 'remirror-table-controller__mark',
    /* prevent the parent (.remirror-table-controller) preview selection hightlight. */
    onMouseOver: stopEvent,
    onMouseOut: stopEvent,
  });
};

export default TableInsertionMark;
