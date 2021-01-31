import { EditorView, NodeView, Selection } from '@remirror/core';
import { Node as ProsemirrorNode } from '@remirror/pm/model';
import { Decoration } from '@remirror/pm/view';
import { CellSelection, TableMap, updateColumnsOnResize } from 'prosemirror-tables';
import { h } from './utils/jsx';
import { REMIRROR_TABLE_CONTROLLER_CLICK_CALLBACK } from './const';

export class TableView implements NodeView {
  root: HTMLElement;
  tableMeasurer: HTMLElement;
  table: HTMLTableElement;
  colgroup: HTMLElement;
  tbody: HTMLElement;
  rowController: HTMLElement;
  colController: HTMLElement;
  cornerController: HTMLElement;

  mounted = false;

  get dom(): HTMLElement {
    return this.root;
  }

  get contentDOM(): HTMLElement {
    return this.tbody;
  }

  constructor(public node: ProsemirrorNode, public cellMinWidth: number, public decorations: Decoration[], public view: EditorView) {
    this.tbody = h('tbody', { class: 'remirror-table-tbody' });
    this.colgroup = h('colgroup', { class: 'remirror-table-colgroup' });
    this.table = h('table', { class: 'remirror-table' }, this.colgroup, this.tbody) as HTMLTableElement;
    this.tableMeasurer = h('div', { class: 'remirror-table-measurer' }, this.table);

    this.rowController = h('div', {
      class: 'remirror-table-controller__row',
      style: 'height: 100px',
    });
    this.colController = h('div', {
      class: 'remirror-table-controller__col',
      style: 'width: 100px',
    });
    this.cornerController = h('div', { class: 'remirror-table-controller__corner' });

    this.root = h(
      'div',
      { class: 'remirror-table-controller-wrapper' },

      this.rowController,
      this.colController,
      this.cornerController,
      this.tableMeasurer,
    );

    // TODO: add a event listener to detect `this.root` insertion
    // see also: https://davidwalsh.name/detect-node-insertion
    this.updateControllers(node);

    console.debug(`[TableView.constructor] decorations:`, this.decorations);

    updateColumnsOnResize(this.node, this.colgroup, this.table, this.cellMinWidth);
  }

  update(node: ProsemirrorNode, decorations: Decoration[]) {
    if (node.type != this.node.type) {
      return false;
    }

    this.decorations = decorations;
    this.node = node;

    console.debug(`[TableView.update] decorations:`, this.decorations);
    updateColumnsOnResize(node, this.colgroup, this.table, this.cellMinWidth);
    this.updateControllers(node);
    return true;
  }

  ignoreMutation(record: ProsemirrorMutationRecord) {
    return record.type == 'attributes' && (record.target == this.table || this.colgroup.contains(record.target));
  }

  private updateControllers(node: ProsemirrorNode) {
    const size = this.getTableSize();
    console.debug(`[TableView.updateControllers] `, size);

    this.rowController.style.height = `${size.tableHeight}px`;
    this.colController.style.width = `${size.tableWidth}px`;

    const rowControllerCells: HTMLElement[] = size.rowHeights.map(
      (height, index): HTMLElement => {
        const cell = h('div', {
          class: 'remirror-table-controller__row-cell',
          style: `height: ${height}px`,
        }) as any;

        // TODO: register custom callback function. UGLY!
        cell[REMIRROR_TABLE_CONTROLLER_CLICK_CALLBACK] = (tablePos: number) => {
          const [rowIndex, colIndex] = [index, 0];
          const map = TableMap.get(this.node);
          const cellIndex = map.width * rowIndex + colIndex;
          const posInTable = map.map[cellIndex + 1];
          console.debug(`[TableView.REMIRROR_TABLE_CONTROLLER_CLICK_CALLBACK] posInTable:${posInTable} tablePos:${tablePos} map:`, map);
          const pos = tablePos + posInTable + 1;
          let tr = this.view.state.tr;
          const $pos = tr.doc.resolve(pos);
          console.debug(`[TableView.REMIRROR_TABLE_CONTROLLER_CLICK_CALLBACK] pos: ${pos} $pos:`, $pos);
          const selection = (CellSelection.rowSelection($pos) as unknown) as Selection;
          console.debug(`[TableView.REMIRROR_TABLE_CONTROLLER_CLICK_CALLBACK] selection:`, selection);
          tr = tr.setSelection(selection);
          this.view.dispatch(tr);
          return 0;
        };
        return cell;
      },
    );
    const colControllerCells: HTMLElement[] = size.colWidths.map(
      (width, index): HTMLElement => {
        const cell = h('div', {
          class: 'remirror-table-controller__col-cell',
          style: `width: ${width}px`,
        }) as any;

        cell[REMIRROR_TABLE_CONTROLLER_CLICK_CALLBACK] = (tablePos: number) => {
          const [rowIndex, colIndex] = [0, index];
          const map = TableMap.get(this.node);
          const cellIndex = map.width * rowIndex + colIndex;
          const posInTable = map.map[cellIndex];
          console.debug(`[TableView.REMIRROR_TABLE_CONTROLLER_CLICK_CALLBACK] posInTable:${posInTable} tablePos:${tablePos} map:`, map);
          const pos = tablePos + posInTable + 1;
          let tr = this.view.state.tr;
          const $pos = tr.doc.resolve(pos);
          const selection = (CellSelection.colSelection($pos) as unknown) as Selection;
          tr = tr.setSelection(selection);
          this.view.dispatch(tr);
        };
        return cell;
      },
    );

    replaceChildren(this.rowController, rowControllerCells);
    replaceChildren(this.colController, colControllerCells);
  }

  private getTableSize() {
    const rect = this.table.getBoundingClientRect();

    return {
      tableHeight: rect.height,
      tableWidth: rect.width,
      rowHeights: getRowHeights(this.table),
      colWidths: getColWidths(this.table),
    };
  }
}

type ProsemirrorMutationRecord = MutationRecord | { type: 'selection'; target: Element };

export function getRowHeights(table: HTMLTableElement) {
  const heights: number[] = [];

  if (table?.lastChild) {
    const rows = table.lastChild.childNodes;

    for (let i = 0, count = rows.length; i < count; i++) {
      const row = rows[i] as HTMLTableRowElement;
      heights[i] = row.getBoundingClientRect().height + 1;
    }
  }

  return heights;
}

export function getColWidths(table: HTMLTableElement) {
  const widths: number[] = [];

  if (table?.lastChild?.lastChild) {
    const row = table.lastChild.lastChild as HTMLTableRowElement;
    const cells = row.childNodes;

    for (let i = 0, count = cells.length; i < count; i++) {
      const cell = cells[i] as HTMLTableCellElement;
      widths[i] = cell.getBoundingClientRect().width;
    }
  }

  return widths;
}

// TODO: this function's performance should be very bad. Maybe we should use some kind of dom diff algorithm.
export function replaceChildren(container: HTMLElement, children: HTMLElement[]) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
  for (const child of children) {
    container.appendChild(child);
  }
}
