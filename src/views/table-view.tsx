import { css, cx } from '@emotion/css';
import { EditorView, NodeView, range } from '@remirror/core';
import { Node as ProsemirrorNode } from '@remirror/pm/model';
import { Decoration } from '@remirror/pm/view';
import { h } from 'jsx-dom/min';
import { TableMap, updateColumnsOnResize } from 'prosemirror-tables';
import TableDeleteButton from '../components/TableDeleteButton';
import TableInsertionButton from '../components/TableInsertionButton';
import { ClassName } from '../const';
import { TableNodeAttrs } from '../table-extension';
import { injectControllers } from '../utils/controller';

export type TableStyleOptions = {
  previewSelectionBorderColor: string;
  selectionBackgroundColor: string;
  previewSelectionControllerBackgroundColor: string;
  selectionControllerBackgroundColor: string;
  controllerSize: number;
  borderColor: string;
  headerCellBackgroundColor: string;
};

export const defaultTableStyleOptions = {
  previewSelectionBorderColor: '#0067ce',
  selectionBackgroundColor: '#edf4ff',
  previewSelectionControllerBackgroundColor: '#5ab1ef',
  selectionControllerBackgroundColor: '#5ab1ef',
  controllerSize: 12,
  borderColor: '#ced3d8',
  headerCellBackgroundColor: 'rgba(220, 222, 224, 0.5)',
};

export function buildTableStyle(options?: TableStyleOptions) {
  const {
    previewSelectionBorderColor,
    selectionBackgroundColor,
    previewSelectionControllerBackgroundColor,
    selectionControllerBackgroundColor,
    controllerSize,
    borderColor,
    headerCellBackgroundColor,
  } = { ...defaultTableStyleOptions, ...options };

  const previewSelectionClass = css`
    border-color: ${previewSelectionBorderColor};
    border-width: 1px;
    border-style: double; // Make the border-style 'double' instead of 'solid'. This works because 'double' has a higher priority than 'solid'.
  `;

  const previewSelectionControllerClass = css`
    ${previewSelectionClass}
    background-color: ${previewSelectionControllerBackgroundColor};
  `;

  const tableClass = css`
    border-collapse: collapse;
    table-layout: fixed;
    width: 100%;
    overflow: hidden;

    & > tbody > tr:first-child {
      height: ${controllerSize}px;
      overflow: visible;

      & > td.${ClassName.TABLE_CONTROLLER}, & > th.${ClassName.TABLE_CONTROLLER} {
        height: ${controllerSize}px;
        overflow: visible;

        & > div {
          height: ${controllerSize}px;
          overflow: visible;
        }
      }
    }

    & > colgroup > col:first-child {
      width: ${controllerSize + 1}px;
      overflow: visible;
    }

    & > tbody > tr > {
      th.${ClassName.SELECTED_CELL}.${ClassName.TABLE_CONTROLLER} {
        background-color: ${selectionControllerBackgroundColor} !important;
      }
      th.${ClassName.SELECTED_CELL}, td.${ClassName.SELECTED_CELL} {
        ${previewSelectionClass};
        background-color: ${selectionBackgroundColor};
      }
    }

    & td,
    & th {
      vertical-align: top;
      box-sizing: border-box;
      position: relative;

      border: solid 1px ${borderColor};
    }

    & th {
      background-color: ${headerCellBackgroundColor};
    }

    & .${ClassName.COLUMN_RESIZE_HANDLE} {
      position: absolute;
      right: -2px;
      top: 0;
      bottom: 0;
      width: 4px;
      z-index: 20;
      background-color: #adf;
      pointer-events: none;
    }
  `;

  const getStyle = (attrs: TableNodeAttrs) => {
    let tableWithPreviewSelection = '';

    if (attrs.previewSelectionColumn !== -1) {
      tableWithPreviewSelection = css`
        & > tbody > tr > {
          td:nth-child(${attrs.previewSelectionColumn + 1}) {
            ${previewSelectionClass};
          }
          th.${ClassName.TABLE_CONTROLLER}:nth-child(${attrs.previewSelectionColumn + 1}) {
            ${previewSelectionControllerClass}
          }
        }
      `;
    } else if (attrs.previewSelectionRow !== -1) {
      tableWithPreviewSelection = css`
        & > tbody > tr:nth-child(${attrs.previewSelectionRow + 1}) > {
          td {
            ${previewSelectionClass};
          }
          th.${ClassName.TABLE_CONTROLLER} {
            ${previewSelectionControllerClass}
          }
        }
      `;
    } else if (attrs.previewSelectionTable) {
      tableWithPreviewSelection = css`
        & > tbody > tr > {
          td {
            ${previewSelectionClass};
          }
          th.${ClassName.TABLE_CONTROLLER} {
            ${previewSelectionControllerClass}
          }
        }
      `;
    }

    return tableWithPreviewSelection ? `${tableClass} ${tableWithPreviewSelection}` : tableClass;
  };

  return getStyle;
}

export class TableView implements NodeView {
  readonly root: HTMLElement;
  readonly table: HTMLElement;
  readonly colgroup: HTMLElement;
  readonly tbody: HTMLElement;
  readonly insertionButtonWrapper: HTMLElement;
  readonly deleteButtonWrapper: HTMLElement;

  map: TableMap;
  getTableStyle: (attrs: TableNodeAttrs) => string;

  get dom() {
    return this.root;
  }

  get contentDOM() {
    return this.tbody;
  }

  constructor(
    public node: ProsemirrorNode,
    public cellMinWidth: number,
    public decorations: Decoration[],
    public view: EditorView,
    public getPos: () => number,
    public styleOption?: TableStyleOptions,
  ) {
    this.map = TableMap.get(this.node);

    this.tbody = h('tbody', { className: 'remirror-table-tbody' });
    this.colgroup = h('colgroup', { class: 'remirror-table-colgroup' }, ...range(this.map.width).map(() => h('col')));
    this.table = h('table', { class: 'remirror-table' }, this.colgroup, this.tbody);
    this.insertionButtonWrapper = h('div');
    this.deleteButtonWrapper = h('div');
    this.root = h(
      'div',
      { className: 'remirror-table-controller-wrapper' },
      this.table,
      this.insertionButtonWrapper,
      this.deleteButtonWrapper,
    );

    if (!this.attrs().isControllersInjected) {
      setTimeout(() => {
        let tr = view.state.tr;
        tr = injectControllers({ view: this.view, getMap: () => this.map, getPos: this.getPos, tr, oldTable: node });
        view.dispatch(tr);
      }, 0); // TODO: better way to do the injection then setTimeout?
      // TODO: add a event listener to detect `this.root` insertion
      // see also: https://davidwalsh.name/detect-node-insertion
    }

    this.getTableStyle = buildTableStyle(this.styleOption);

    this.render();
  }

  update(node: ProsemirrorNode, decorations: Decoration[]): boolean {
    console.debug(`[TableView] update`);
    if (node.type != this.node.type) {
      return false;
    }

    this.decorations = decorations;
    this.node = node;
    this.map = TableMap.get(this.node);

    this.render();

    return true;
  }

  private render() {
    if (!this.attrs().isControllersInjected) {
      return;
    }

    this.renderTable();
    this.renderInsertionButton();
    this.renderDeletButton();
  }

  private renderTable() {
    if (this.colgroup.children.length !== this.map.width) {
      const cols = range(this.map.width).map(() => h('col'));
      replaceChildren(this.colgroup, cols);
    }
    const tableClass = this.getTableStyle(this.attrs());
    this.table.className = `remirror-table ${tableClass}`;
    updateColumnsOnResize(this.node, this.colgroup, this.table, this.cellMinWidth);
  }

  private renderInsertionButton() {
    const attrs = this.attrs().insertionButtonAttrs;
    if (attrs) {
      let button = TableInsertionButton({
        view: this.view,
        attrs,
        tableRect: {
          map: this.map,
          table: this.node,
          tableStart: this.getPos() + 1,

          // The following properties are not actually used
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
        },
      });
      replaceChildren(this.insertionButtonWrapper, [button]);
    } else {
      replaceChildren(this.insertionButtonWrapper, []);
    }
  }

  private renderDeletButton() {
    const attrs = this.attrs().deleteButtonAttrs;
    if (attrs) {
      let button = TableDeleteButton({ view: this.view, map: this.map, attrs });
      replaceChildren(this.deleteButtonWrapper, button ? [button] : []);
    } else {
      replaceChildren(this.deleteButtonWrapper, []);
    }
  }

  private attrs() {
    return this.node.attrs as TableNodeAttrs;
  }

  ignoreMutation(record: ProsemirrorMutationRecord) {
    return record.type == 'attributes';
  }
}

type ProsemirrorMutationRecord = MutationRecord | { type: 'selection'; target: Element };

// TODO: this function's performance should be very bad. Maybe we should use some kind of DOM-diff algorithm.
export function replaceChildren(parent: Node, children: Node[]) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
  for (const child of children) {
    parent.appendChild(child);
  }
}
