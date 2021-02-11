import { EditorView, NodeView, range } from '@remirror/core';
import { Node as ProsemirrorNode } from '@remirror/pm/model';
import { Decoration } from '@remirror/pm/view';
import { h } from 'jsx-dom/min';
import { TableMap, updateColumnsOnResize } from 'prosemirror-tables';
import { TableNodeAttrs } from '../table-extension';
import { injectControllers } from '../utils/controller';
import { setNodeAttrs } from '../utils/prosemirror';

function debug(...params: any[]) {
  console.debug('[src/table-view.tsx]', ...params);
}

export class TableView implements NodeView {
  root: HTMLElement;
  tbody: HTMLElement;
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
    this.map = TableMap.get(this.node);
    this.tbody = h('tbody', { className: 'remirror-table-tbody' });
    this.root = this.render();

    if (!this.attrs().isControllersInjected) {
      setTimeout(() => {
        let tr = view.state.tr;
        // tr.setSelection();

        view.state.selection;
        tr = setNodeAttrs(tr, getPos(), { isControllersInjected: true });
        tr = injectControllers({ view: this.view, getMap: () => this.map, getPos: this.getPos, tr, oldTable: node });
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
    if (this.attrs().previewSelectionColumn !== -1) {
      cols[this.attrs().previewSelectionColumn]?.classList.add('remirror-table-col--selected');
    }
    const colgroup = h('colgroup', { class: 'remirror-table-colgroup' }, ...cols);

    let className = `remirror-table ${this.attrs().previewSelection ? 'remirror-table--selected' : ''}`;
    const table = h('table', { class: className }, colgroup, this.tbody); // TODO: don't need to re-create a table node

    if (!this.root) {
      this.root = h('div', { className: 'remirror-table-controller-wrapper' }, table);
    } else {
      replaceChildren(this.root as Node, [table]);
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

  private attrs() {
    return this.node.attrs as TableNodeAttrs;
  }

  ignoreMutation(record: ProsemirrorMutationRecord) {
    // return record.type == 'attributes' && (record.target == this.table || (this.colgroup && this.colgroup.contains(record.target)));
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
