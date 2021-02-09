import { EditorView, NodeView } from '@remirror/core';
import { Node as ProsemirrorNode } from '@remirror/pm/model';
import { Decoration } from '@remirror/pm/view';
import { h } from 'jsx-dom';
import TableControllerCell from './TableControllerCell';

export class TableControllerCellView implements NodeView {
  public dom: HTMLElement;
  public contentDOM: HTMLElement;

  constructor(public node: ProsemirrorNode, public view: EditorView, public getPos: () => number, decorations: Decoration[]) {
    this.contentDOM = h('div', { contentEditable: false });
    this.dom = TableControllerCell({ node, view, getPos, decorations, contentDOM: this.contentDOM });
  }

  // When a DOM mutation happens (eg: the button show or hide), don't let ProsemirrorNode re-render the view.
  ignoreMutation() {
    return true;
  }
}
