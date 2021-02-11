import {
  ApplySchemaAttributes,
  CreatePluginReturn,
  Decoration,
  EditorView,
  NodeExtension,
  NodeViewMethod,
  ProsemirrorNode,
  ProsemirrorPlugin,
} from '@remirror/core';
import {
  TableCellExtension as RemirrorTableCellExtension,
  TableExtension as RemirrorTableExtension,
  TableHeaderCellExtension as RemirrorTableHeaderCellExtension,
  TableRowExtension as RemirrorTableRowExtension,
} from '@remirror/preset-table';
import { TableSchemaSpec } from '@remirror/preset-table/dist/declarations/src/table-utils';
import { tableEditing } from 'prosemirror-tables';
import { InsertionButtonAttrs } from './components/TableInsertionButton';
import { ControllerType } from './const';
import { columnResizing } from './table-column-resizing';
import { newTableContollerPlugin, TableContollerPluginState } from './table-plugin';
import { Events } from './utils/jsx';
import { TableControllerCellView } from './views/table-controller-cell-view';
import { TableView } from './views/table-view';

export type TableNodeAttrs<T extends Record<string, any> = Record<never, never>> = T & {
  isControllersInjected: boolean;
  previewSelection: boolean;
  previewSelectionColumn: number;

  // if and only if `insertionButtonAttrs` exists, InsertionButton will show.
  insertionButtonAttrs: null | InsertionButtonAttrs;
};

export class TableExtension extends RemirrorTableExtension {
  get name() {
    return 'table' as const;
  }

  createNodeViews(): NodeViewMethod {
    return (node: ProsemirrorNode, view: EditorView, getPos: boolean | (() => number), decorations: Decoration[]) => {
      return new TableView(node, 10, decorations, view, getPos as () => number);
    };
  }

  createPlugin(): CreatePluginReturn<TableContollerPluginState> {
    return newTableContollerPlugin();
  }

  /**
   * Add the table plugins to the editor.
   */
  createExternalPlugins(): ProsemirrorPlugin[] {
    const plugins = [tableEditing()];

    if (this.options.resizable) {
      plugins.push(columnResizing({ firstResizableColumn: 1 }));
    }

    return plugins;
  }

  createNodeSpec(extra: ApplySchemaAttributes): TableSchemaSpec {
    const spec: TableSchemaSpec = {
      isolating: true,
      attrs: {
        ...extra.defaults(),
        isControllersInjected: { default: false },
        previewSelection: { default: false },
        previewSelectionColumn: { default: -1 },
        insertionButtonAttrs: { default: null },
      },
      content: 'tableRow+',
      tableRole: 'table',
      parseDOM: [{ tag: 'table', getAttrs: extra.parse }],
      toDOM(node) {
        return ['table', ['tbody', extra.dom(node), 0]];
      },
    };
    console.debug(`[TableView.createNodeSpec]`, spec);
    return spec;
  }
}

export class TableRowExtension extends RemirrorTableRowExtension {
  get name() {
    return 'tableRow' as const;
  }

  createNodeSpec(extra: ApplySchemaAttributes): TableSchemaSpec {
    const spec = super.createNodeSpec(extra);
    spec.content = '(tableCell | tableHeaderCell | tableControllerCell)*';
    spec.attrs = {
      ...spec.attrs,
      previewSelection: { default: false },
    };
    spec.toDOM = (node) => {
      const attrs = {
        ...extra.dom(node),
      };
      if (node.attrs.previewSelection) {
        if (attrs.class) {
          attrs.class = `${attrs.class} remirror-table-row--selected`;
        } else {
          attrs.class = `remirror-table-row--selected`;
        }
      }
      return ['tr', attrs, 0];
    };
    return spec;
  }
}

export class TableHeaderCellExtension extends RemirrorTableHeaderCellExtension {
  get name() {
    return 'tableHeaderCell' as const;
  }

  createNodeSpec(extra: ApplySchemaAttributes): TableSchemaSpec {
    const spec = super.createNodeSpec(extra);
    spec.attrs = {
      ...spec.attrs,
    };
    return spec;
  }
}

export class TableCellExtension extends RemirrorTableCellExtension {
  get name() {
    return 'tableCell' as const;
  }
}

export type TableControllerCellAttrs = {
  colspan: number;
  rowspan: number;
  colwidth: null | number;
  background: null | string;
  controllerType: null | ControllerType;
  events: null | Events;
};

export class TableControllerCellExtension extends NodeExtension {
  get name() {
    return 'tableControllerCell' as const;
  }

  createNodeSpec(extra: ApplySchemaAttributes): TableSchemaSpec {
    const cellAttrs = {
      ...extra.defaults(),

      colspan: { default: 1 },
      rowspan: { default: 1 },
      colwidth: { default: null },
      background: { default: null },

      controllerType: { default: null },

      events: { default: null },
    };

    return {
      atom: true,
      isolating: true,
      content: 'block*',
      attrs: cellAttrs,
      tableRole: 'header_cell',
      toDOM(node) {
        return ['th', 0];
      },
    };
  }

  createNodeViews(): NodeViewMethod {
    return (node: ProsemirrorNode, view: EditorView, getPos: boolean | (() => number), decorations: Decoration[]) => {
      return new TableControllerCellView(node, view, getPos as () => number, decorations);
    };
  }
}
