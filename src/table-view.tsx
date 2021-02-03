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
    // const tableHeaderCells: Array<HTMLTableCellElement | HTMLTableHeaderCellElement> = [];

    // if (this.isControllersInjected()) {
    //   tableHeaderCells.push(...range(this.map.width).map(() => h('th', {}, h('div'))));
    // } else {
    //   tableHeaderCells.push(
    //     ...range(this.map.width).map((i) => {
    //       /*
    //       By CSS 2.1 rules, the height of a table cell is “the minimum height required by the content”.
    //       Thus, you need to restrict the height indirectly using inner markup, normally a div element
    //       (<td><div>content</div></td>).
    //       */
    //       const th = h('th', {}, h('div'));
    //       if (i === 0) {
    //         th.onclick = () =>
    //           onClickController({
    //             rowIndex: 0,
    //             colIndex: 0,
    //             type: ControllerType.CORNER_CONTROLLER,
    //             getPos: this.getPos,
    //             map: this.map,
    //             view: this.view,
    //           });
    //       } else {
    //         th.onclick = () =>
    //           onClickController({
    //             rowIndex: 0,
    //             colIndex: i,
    //             type: ControllerType.COLUMN_CONTROLLER,
    //             getPos: this.getPos,
    //             map: this.map,
    //             view: this.view,
    //           });
    //       }
    //       return th;
    //     }),
    //   );
    // }

    // const thead = h('thead', { class: 'remirror-table-thead' }, h('tr', { class: 'remirror-table-controller' }, ...tableHeaderCells));
    const colgroup = h('colgroup', { class: 'remirror-table-colgroup' }, h('col'));
    const table = h('table', { class: 'remirror-table' }, colgroup, this.tbody);

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

  private injectControllers(tr: Transaction, oldTable: ProsemirrorNode, pos: number, schema: Schema): Transaction {
    const headerControllerCells: ProsemirrorNode[] = range(this.map.width + 1).map((i) => {
      if (i === 0) {
        const getOnClickControllerParams = (): OnClickControllerParams => ({
          getPos: this.getPos,
          map: this.map,
          view: this.view,
          rowIndex: 0,
          colIndex: 0,
          type: ControllerType.CORNER_CONTROLLER,
        });
        return schema.nodes.tableControllerCell.create({
          controllerType: ControllerType.CORNER_CONTROLLER,
          getOnClickControllerParams: getOnClickControllerParams,
        });
      } else {
        const getOnClickControllerParams = (): OnClickControllerParams => ({
          getPos: this.getPos,
          map: this.map,
          view: this.view,
          rowIndex: 0,
          colIndex: i,
          type: ControllerType.COLUMN_CONTROLLER,
        });
        return schema.nodes.tableControllerCell.create({
          controllerType: ControllerType.COLUMN_CONTROLLER,
          getOnClickControllerParams: getOnClickControllerParams,
        });
      }
    });

    const crotrollerRow: ProsemirrorNode = schema.nodes.tableRow.create({}, headerControllerCells);
    const newRowsArray: ProsemirrorNode[] = [crotrollerRow];

    const oldRows = oldTable.content;
    oldRows.forEach((oldRow, _, index) => {
      const getOnClickControllerParams = (): OnClickControllerParams => ({
        getPos: this.getPos,
        map: this.map,
        view: this.view,
        rowIndex: index + 1,
        colIndex: 0,
        type: ControllerType.ROW_CONTROLLER,
      });
      const controllerCell = schema.nodes.tableControllerCell.create({
        controllerType: ControllerType.ROW_CONTROLLER,
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

export class TableControllerCellView implements NodeView {
  private th: HTMLTableHeaderCellElement;
  private div: HTMLDivElement;

  constructor(public node: ProsemirrorNode, public view: EditorView, public getPos: () => number, decorations: Decoration[]) {
    const controllerType = node.attrs.controllerType;
    let className = '';
    if (controllerType === ControllerType.ROW_CONTROLLER) className = 'remirror-table-row-controller';
    else if (controllerType === ControllerType.COLUMN_CONTROLLER) className = 'remirror-table-column-controller';
    else if (controllerType === ControllerType.CORNER_CONTROLLER) className = 'remirror-table-corner-controller';

    this.div = h('div');
    this.th = h('th', { class: 'remirror-table-controller ' + className }, this.div);
    this.div.contentEditable = 'false';
    this.th.contentEditable = 'false';

    if (node.attrs.getOnClickControllerParams) {
      this.th.onclick = (e) => {
        console.debug(`TableControllerCellView onclick`);

        onClickController(node.attrs.getOnClickControllerParams());
        e.preventDefault();
      };
    }
  }

  get dom(): HTMLElement {
    return this.th;
  }

  get contentDOM(): HTMLElement {
    return this.div;
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
  } else if (type === ControllerType.COLUMN_CONTROLLER) {
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
