import { EditorView, NodeView, range, Transaction } from '@remirror/core';
import { Fragment, Node as ProsemirrorNode, Schema } from '@remirror/pm/model';
import { Decoration } from '@remirror/pm/view';
import { Selection } from 'prosemirror-state';
import { CellSelection, TableMap, updateColumnsOnResize } from 'prosemirror-tables';
import { ControllerType } from './const';
import React, { CSSProperties, h } from 'jsx-dom';
import { DOM, Events } from './utils/jsx';
import { stopEvent } from './utils/dom';

function debug(...params: any[]) {
  console.debug('[src/table-view.tsx]', ...params);
}

export class TableView implements NodeView {
  root: DOM;
  tbody: DOM;
  map: TableMap;

  mounted = false;

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
  ) {
    this.map = TableMap.get(this.node);
    this.tbody = <tbody className='remirror-table-tbody' />;
    this.root = this.render();

    if (!node.attrs.isControllersInjected) {
      setTimeout(() => {
        let tr = view.state.tr;
        // tr.setSelection();

        view.state.selection;
        tr = tr.setNodeMarkup(getPos(), undefined, { isControllersInjected: true });
        tr = this.injectControllers(tr, node, getPos(), view.state.schema);
        view.dispatch(tr);
      }, 0); // TODO: better way to do the injection then setTimeout?
      // TODO: add a event listener to detect `this.root` insertion
      // see also: https://davidwalsh.name/detect-node-insertion
    }
  }

  update(node: ProsemirrorNode, decorations: Decoration[]): boolean {
    debug('TableView.update');
    if (node.type != this.node.type) {
      return false;
    }

    this.decorations = decorations;

    const shouldComponentUpdate = this.shouldComponentUpdate(node);
    debug('TableView.update shouldComponentUpdate:', shouldComponentUpdate);
    if (shouldComponentUpdate) {
      this.render();
    }

    return true;
  }

  private render() {
    const cols = range(this.map.width).map(() => h('col'));
    if (this.previewSelectionColumn() !== -1) {
      cols[this.previewSelectionColumn()]?.classList.add('remirror-table-col--selected');
    }
    const colgroup = h('colgroup', { class: 'remirror-table-colgroup' }, ...cols);
    const table = h(
      'table',
      { class: `remirror-table ${this.previewSelection() ? 'remirror-table--selected' : ''}` },
      colgroup,
      this.tbody,
    ); // TODO: don't need to re-create a table node

    if (!this.root) {
      this.root = h('div', { class: 'remirror-table-controller-wrapper' }, table);
    } else {
      replaceChildren(this.root, [table]);
    }

    updateColumnsOnResize(this.node, colgroup, table, this.cellMinWidth);
    return this.root;
  }

  private shouldComponentUpdate(newNode: ProsemirrorNode): boolean {
    const oldNode = this.node;
    const [oldMap, newMap] = [this.map, TableMap.get(newNode)];

    const shouldComponentUpdate = newMap.width !== oldMap.width || newMap.height !== oldMap.height || !oldNode.sameMarkup(newNode);
    this.map = newMap;
    this.node = newNode;
    return shouldComponentUpdate;
  }

  private isControllersInjected(): boolean {
    return this.node.attrs.isControllersInjected;
  }

  private previewSelection(): boolean {
    return this.node.attrs.previewSelection;
  }

  private previewSelectionColumn(): number {
    return this.node.attrs.previewSelectionColumn;
  }

  private injectControllers(tr: Transaction, oldTable: ProsemirrorNode, pos: number, schema: Schema): Transaction {
    const headerControllerCells: ProsemirrorNode[] = range(this.map.width + 1).map((i) => {
      if (i === 0) {
        let events: Events = {
          onClick: () => selectTable(this.view, this.getPos(), this.map),
          onMouseOver: () => previewSelectTable(this.view, this.getPos()),
          onMouseOut: () => previewLeaveTable(this.view, this.getPos()),
        };
        return schema.nodes.tableControllerCell.create({ controllerType: ControllerType.CORNER_CONTROLLER, events });
      } else {
        let events: Events = {
          onClick: () => selectColumn(this.view, this.getPos(), this.map, i),
          onMouseOver: () => previewSelectColumn(this.view, this.getPos(), i),
          onMouseOut: () => previewLeaveColumn(this.view, this.getPos()),
        };
        return schema.nodes.tableControllerCell.create({ controllerType: ControllerType.COLUMN_CONTROLLER, events });
      }
    });

    const crotrollerRow: ProsemirrorNode = schema.nodes.tableRow.create({}, headerControllerCells);
    const newRowsArray: ProsemirrorNode[] = [crotrollerRow];

    const oldRows = oldTable.content;
    oldRows.forEach((oldRow, _, index) => {
      let events: Events = {
        onClick: () => selectRow(this.view, this.getPos(), this.map, index + 1),
        onMouseOver: () => previewSelectRow(this.view, this.getPos(), this.map, index + 1),
        onMouseOut: () => previewLeaveRow(this.view, this.getPos(), this.map, index + 1),
      };
      const controllerCell = schema.nodes.tableControllerCell.create({ controllerType: ControllerType.ROW_CONTROLLER, events });
      const oldCells = oldRow.content;
      const newCells = Fragment.from(controllerCell).append(oldCells);
      const newRow = oldRow.copy(newCells);
      newRowsArray.push(newRow);
    });

    const newRows = Fragment.fromArray(newRowsArray);
    const newTable = oldTable.copy(newRows);

    return tr.replaceRangeWith(pos, pos + oldTable.nodeSize, newTable);
  }

  ignoreMutation(record: ProsemirrorMutationRecord) {
    // return record.type == 'attributes' && (record.target == this.table || (this.colgroup && this.colgroup.contains(record.target)));
    return record.type == 'attributes';
  }
}

export class TableControllerCellView implements NodeView {
  private th: DOM;
  public contentDOM: DOM;

  constructor(public node: ProsemirrorNode, public view: EditorView, public getPos: () => number, decorations: Decoration[]) {
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

    let addColumnTriggerAreaStyle: CSSProperties = {
      flex: 1,
      height: 24,
      position: 'relative',
      zIndex: 10,
      opacity: 0.5,
    };
    let addColumnTriggerArea1 = <div style={{ ...addColumnTriggerAreaStyle, background: 'lightpink' }}></div>;
    let addColumnTriggerArea2 = <div style={{ ...addColumnTriggerAreaStyle, background: 'lightblue' }}></div>;

    this.contentDOM = <div contentEditable={false} />;
    let wrapper = (
      <div contentEditable={false} className='remirror-table-controller__add-column-wrapper'>
        {addColumnTriggerArea1}
        {addColumnTriggerArea2}
        {this.contentDOM}
        {mark}
      </div>
    );

    this.th = (
      <th contentEditable={false} className={'remirror-table-controller ' + className} {...node.attrs.events}>
        {wrapper}
      </th>
    );
  }

  get dom() {
    return this.th;
  }
}

type ProsemirrorMutationRecord = MutationRecord | { type: 'selection'; target: Element };

// TODO: this function's performance should be very bad. Maybe we should use some kind of DOM-diff algorithm.
export function replaceChildren(container: DOM, children: DOM[]) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
  for (const child of children) {
    container.appendChild(child);
  }
}

function getCellIndex(map: TableMap, rowIndex: number, colIndex: number): number {
  return map.width * rowIndex + colIndex;
}

function selectRow(view: EditorView, tablePos: number, map: TableMap, rowIndex: number) {
  const cellIndex = getCellIndex(map, rowIndex, 0);
  let tr = view.state.tr;
  const posInTable = map.map[cellIndex + 1];
  const pos = tablePos + posInTable + 1;
  const $pos = tr.doc.resolve(pos);
  const selection = CellSelection.rowSelection($pos);
  tr = tr.setSelection((selection as unknown) as Selection); // TODO: https://github.com/ProseMirror/prosemirror-tables/pull/126
  view.dispatch(tr);
}

function selectColumn(view: EditorView, tablePos: number, map: TableMap, colIndex: number) {
  const cellIndex = getCellIndex(map, 0, colIndex);
  let tr = view.state.tr;
  const posInTable = map.map[cellIndex];
  const pos = tablePos + posInTable + 1;
  const $pos = tr.doc.resolve(pos);
  const selection = CellSelection.colSelection($pos);
  tr = tr.setSelection((selection as unknown) as Selection);
  view.dispatch(tr);
}

function selectTable(view: EditorView, tablePos: number, map: TableMap) {
  if (map.map.length > 0) {
    let tr = view.state.tr;
    const firstCellPosInTable = map.map[0];
    const lastCellPosInTable = map.map[map.map.length - 1];
    const firstCellPos = tablePos + firstCellPosInTable + 1;
    const lastCellPos = tablePos + lastCellPosInTable + 1;
    const $firstCellPos = tr.doc.resolve(firstCellPos);
    const $lastCellPos = tr.doc.resolve(lastCellPos);
    const selection = new CellSelection($firstCellPos, $lastCellPos);
    tr = tr.setSelection((selection as unknown) as Selection);
    view.dispatch(tr);
  }
}

function previewSelectRow(view: EditorView, tablePos: number, map: TableMap, rowIndex: number) {
  const posInTable = map.map[getCellIndex(map, rowIndex, 0)];
  const rowPos = tablePos + posInTable;
  view.dispatch(view.state.tr.setNodeMarkup(rowPos, undefined, { previewSelection: true }));
}

function previewLeaveRow(view: EditorView, tablePos: number, map: TableMap, rowIndex: number) {
  const posInTable = map.map[getCellIndex(map, rowIndex, 0)];
  const rowPos = tablePos + posInTable;
  view.dispatch(view.state.tr.setNodeMarkup(rowPos, undefined, { previewSelection: false }));
}

function previewSelectColumn(view: EditorView, tablePos: number, columnIndex: number) {
  view.dispatch(view.state.tr.setNodeMarkup(tablePos, undefined, { previewSelectionColumn: columnIndex }));
}
function previewLeaveColumn(view: EditorView, tablePos: number) {
  view.dispatch(view.state.tr.setNodeMarkup(tablePos, undefined, { previewSelectionColumn: -1 }));
}

function previewSelectTable(view: EditorView, tablePos: number) {
  view.dispatch(view.state.tr.setNodeMarkup(tablePos, undefined, { previewSelection: true }));
}
function previewLeaveTable(view: EditorView, tablePos: number) {
  view.dispatch(view.state.tr.setNodeMarkup(tablePos, undefined, { previewSelection: false }));
}
