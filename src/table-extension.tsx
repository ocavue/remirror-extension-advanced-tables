import {
  ApplySchemaAttributes,
  CreatePluginReturn,
  Decoration,
  EditorView,
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
import { columnResizing } from './table-column-resizing';
import { newTableContollerPlugin, TableContollerPluginState } from './table-plugin';
import { TableHeaderCellView, TableView } from './table-view';

export class TableExtension extends RemirrorTableExtension {
  get name() {
    return 'table' as const;
  }

  createNodeViews = (): NodeViewMethod => {
    return (node: ProsemirrorNode, view: EditorView, getPos: boolean | (() => number), decorations: Decoration[]) => {
      return new TableView(node, 10, decorations, view, getPos as () => number);
    };
  };

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
}

export class TableHeaderCellExtension extends RemirrorTableHeaderCellExtension {
  get name() {
    return 'tableHeaderCell' as const;
  }

  createNodeViews = (): NodeViewMethod => {
    return (node: ProsemirrorNode, view: EditorView, getPos: boolean | (() => number), decorations: Decoration[]) => {
      return new TableHeaderCellView(node, view, getPos as () => number, decorations);
    };
  };

  createNodeSpec(extra: ApplySchemaAttributes): TableSchemaSpec {
    const spec = super.createNodeSpec(extra);
    spec.attrs = {
      ...spec.attrs,
      isRowController: { default: false },
      getOnClickControllerParams: { default: null },
    };
    return spec;
  }
}

export class TableCellExtension extends RemirrorTableCellExtension {
  get name() {
    return 'tableCell' as const;
  }
}
