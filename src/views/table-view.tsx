import { EditorView, NodeView, range } from '@remirror/core';
import { Node as ProsemirrorNode } from '@remirror/pm/model';
import { Decoration } from '@remirror/pm/view';
import { h } from 'jsx-dom/min';
import { TableMap, updateColumnsOnResize } from 'prosemirror-tables';
import TableDeleteButton from '../components/TableDeleteButton';
import TableInsertionButton from '../components/TableInsertionButton';
import { TableNodeAttrs } from '../table-extension';
import { injectControllers } from '../utils/controller';
import { setNodeAttrs } from '../utils/prosemirror';

export class TableView implements NodeView {
  readonly root: HTMLElement;
  readonly table: HTMLElement;
  readonly colgroup: HTMLElement;
  readonly tbody: HTMLElement;
  readonly insertionButtonWrapper: HTMLElement;
  readonly deleteButtonWrapper: HTMLElement;
  map: TableMap;

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
    console.debug(`[TableView] constructor`);

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
    } else {
      this.render();
    }
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
    const cols = range(this.map.width).map(() => h('col'));
    if (this.attrs().previewSelectionColumn !== -1) {
      cols[this.attrs().previewSelectionColumn]?.classList.add('remirror-table-col--selected');
    }
    replaceChildren(this.colgroup, cols);
    this.table.className = `remirror-table ${this.attrs().previewSelection ? 'remirror-table--selected' : ''}`;
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
    let button = TableDeleteButton({ view: this.view, node: this.node });
    if (button) {
      replaceChildren(this.deleteButtonWrapper, [button]);
    } else {
      replaceChildren(this.deleteButtonWrapper, []);
    }
  }

  private attrs() {
    return this.node.attrs as TableNodeAttrs;
  }

  ignoreMutation(record: ProsemirrorMutationRecord) {
    return record.type == 'attributes' && (record.target == this.table || (this.colgroup && this.colgroup.contains(record.target)));
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
