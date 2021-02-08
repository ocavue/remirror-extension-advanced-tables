import React from 'jsx-dom';

import { EditorView, NodeView } from '@remirror/core';
import { Node as ProsemirrorNode } from '@remirror/pm/model';
import { Decoration } from '@remirror/pm/view';
import TableControllerCell from './TableControllerCell';
import { DOM } from '../utils/jsx';

export class TableControllerCellView implements NodeView {
  public dom: DOM;
  public contentDOM: DOM;

  constructor(public node: ProsemirrorNode, public view: EditorView, public getPos: () => number, decorations: Decoration[]) {
    this.contentDOM = <div contentEditable={false} />;
    this.dom = <TableControllerCell node={node} view={view} getPos={getPos} decorations={decorations} contentDOM={this.contentDOM} />;
  }
}
