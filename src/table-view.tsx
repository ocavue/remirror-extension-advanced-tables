import { EditorView, NodeView, range, Transaction } from '@remirror/core';
import { Fragment, Node as ProsemirrorNode, Schema } from '@remirror/pm/model';
import { Decoration } from '@remirror/pm/view';
import { Selection } from 'prosemirror-state';
import { CellSelection, TableMap, updateColumnsOnResize } from 'prosemirror-tables';
import { ControllerType } from './const';
import { h } from './utils/jsx';

function debug(...params: any[]) {
  console.debug('[src/table-view.tsx]', ...params);
}

export class TableView implements NodeView {
  root: HTMLElement;
  tbody: HTMLElement;
  map: TableMap;

  mounted = false;

  get dom(): HTMLElement {
    return this.root;
  }

  get contentDOM(): HTMLElement {
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
    this.tbody = h('tbody', { class: 'remirror-table-tbody' });
    this.root = this.render();

    if (!node.attrs.isControllersInjected) {
      setTimeout(() => {
        let tr = view.state.tr;
        // tr.setSelection();

        view.state.selection;
        tr = tr.setNodeMarkup(getPos(), undefined, { isControllersInjected: true });
        tr = this.injectRowControllers(tr, node, getPos(), view.state.schema);
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
    const tableHeaderCells: Array<HTMLTableCellElement | HTMLTableHeaderCellElement> = [];

    if (this.isControllersInjected()) {
      tableHeaderCells.push(...range(this.map.width).map(() => h('th')));
    } else {
      tableHeaderCells.push(
        ...range(this.map.width).map((i) => {
          const th = h('th');
          if (i === 0) {
            th.onclick = () =>
              onClickController({
                rowIndex: 0,
                colIndex: 0,
                type: ControllerType.CORNER_CONTROLLER,
                getPos: this.getPos,
                map: this.map,
                view: this.view,
              });
          } else {
            th.onclick = () =>
              onClickController({
                rowIndex: 0,
                colIndex: i,
                type: ControllerType.COL_CONTROLLER,
                getPos: this.getPos,
                map: this.map,
                view: this.view,
              });
          }
          return th;
        }),
      );
    }

    const thead = h('thead', { class: 'remirror-table-thead' }, h('tr', { class: 'remirror-table-controller' }, ...tableHeaderCells));
    const colgroup = h('colgroup', { class: 'remirror-table-colgroup' }, h('col'));
    const table = h('table', { class: 'remirror-table' }, colgroup, thead, this.tbody);

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

  private injectRowControllers(tr: Transaction, oldTable: ProsemirrorNode, pos: number, schema: Schema): Transaction {
    const oldRows = oldTable.content;

    const newRowsArray: ProsemirrorNode[] = [];
    // let newTable: ProsemirrorNode;

    oldRows.forEach((oldRow, _, index) => {
      debug('injectRowControllers index:', index);

      const getOnClickControllerParams = (): OnClickControllerParams => ({
        getPos: this.getPos,
        map: this.map,
        view: this.view,
        rowIndex: index,
        colIndex: 0,
        type: ControllerType.ROW_CONTROLLER,
      });
      const controllerCell = schema.nodes.tableHeaderCell.create({
        isRowController: true,
        getOnClickControllerParams: getOnClickControllerParams,
      });
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

export class TableHeaderCellView implements NodeView {
  private th: HTMLTableHeaderCellElement;

  constructor(public node: ProsemirrorNode, public view: EditorView, public getPos: () => number, decorations: Decoration[]) {
    this.th = h('th', { class: 'remirror-table-controller' });

    if (node.attrs.isRowController) {
      if (node.attrs.getOnClickControllerParams) {
        this.th.onclick = (e) => {
          onClickController(node.attrs.getOnClickControllerParams());
          e.preventDefault();
        };
      }
    }
  }

  get dom(): HTMLElement {
    return this.th;
  }

  get contentDOM(): HTMLElement {
    return this.th;
  }
}

type ProsemirrorMutationRecord = MutationRecord | { type: 'selection'; target: Element };

// TODO: this function's performance should be very bad. Maybe we should use some kind of DOM-diff algorithm.
export function replaceChildren(container: HTMLElement, children: HTMLElement[]) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
  for (const child of children) {
    container.appendChild(child);
  }
}

type OnClickControllerParams = {
  type: ControllerType;
  rowIndex: number;
  colIndex: number;
  getPos: () => number;
  map: TableMap;
  view: EditorView;
};

function onClickController({ rowIndex, colIndex, type, getPos, map, view }: OnClickControllerParams) {
  const tablePos = getPos();
  const cellIndex = map.width * rowIndex + colIndex;
  let tr = view.state.tr;

  if (type === ControllerType.ROW_CONTROLLER) {
    const posInTable = map.map[cellIndex + 1];
    const pos = tablePos + posInTable + 1;
    const $pos = tr.doc.resolve(pos);
    const selection = CellSelection.rowSelection($pos);
    tr = tr.setSelection((selection as unknown) as Selection); // TODO: https://github.com/ProseMirror/prosemirror-tables/pull/126
    view.dispatch(tr);
  } else if (type === ControllerType.COL_CONTROLLER) {
    const posInTable = map.map[cellIndex];
    const pos = tablePos + posInTable + 1;
    const $pos = tr.doc.resolve(pos);
    const selection = CellSelection.colSelection($pos);
    tr = tr.setSelection((selection as unknown) as Selection);
    view.dispatch(tr);
  } else {
    if (map.map.length > 0) {
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
}
