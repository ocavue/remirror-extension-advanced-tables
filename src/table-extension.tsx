import {
  ApplySchemaAttributes,
  Decoration,
  EditorView,
  extension,
  ExtensionPriority,
  NodeExtension,
  NodeSpecOverride,
  NodeViewMethod,
  ProsemirrorNode,
  ProsemirrorPlugin,
  command,
  CommandFunction,
  NodeExtensionSpec,
} from '@remirror/core';
import {
  TableCellExtension as RemirrorTableCellExtension,
  TableExtension as RemirrorTableExtension,
  TableHeaderCellExtension as RemirrorTableHeaderCellExtension,
  TableRowExtension as RemirrorTableRowExtension,
} from '@remirror/extension-tables';
import type { TableSchemaSpec } from '@remirror/extension-tables/dist/declarations/src/table-utils';
import { tableEditing } from 'prosemirror-tables';
import { DeleteButtonAttrs } from './components/TableDeleteButton';
import { InsertionButtonAttrs } from './components/TableInsertionButton';
import { columnResizing } from './table-column-resizing';
import { newTableDecorationPlugin, newTableDeleteStatePlugin } from './table-plugin';
import { TableControllerCellView } from './views/table-controller-cell-view';
import { TableView } from './views/table-view';
import { ExtensionTablesMessages as Messages } from '@remirror/messages';
import { createTable, CreateTableCommand } from './utils/table';
import { TextSelection } from '@remirror/pm/state';

const createTableCommand: Remirror.CommandDecoratorOptions = {
  icon: 'table2',
  description: ({ t }) => t(Messages.CREATE_COMMAND_DESCRIPTION),
  label: ({ t }) => t(Messages.CREATE_COMMAND_LABEL),
};

export type TableNodeAttrs<T extends Record<string, any> = Record<never, never>> = T & {
  isControllersInjected: boolean;
  previewSelectionTable: boolean;
  previewSelectionColumn: number;
  previewSelectionRow: number;

  // if and only if `insertionButtonAttrs` exists, InsertionButton will show.
  insertionButtonAttrs: InsertionButtonAttrs | null;

  // if and only if `deleteButtonAttrs` exists, DeleteButton will show.
  deleteButtonAttrs: DeleteButtonAttrs | null;
};

@extension({ defaultPriority: ExtensionPriority.Low })
export class TableExtension extends RemirrorTableExtension {
  get name() {
    return 'table' as const;
  }

  createNodeViews(): NodeViewMethod {
    return (node: ProsemirrorNode, view: EditorView, getPos: boolean | (() => number), decorations: Decoration[]) => {
      return new TableView(node, 10, decorations, view, getPos as () => number);
    };
  }

  createPlugin() {
    return newTableDecorationPlugin();
  }

  /**
   * Add the table plugins to the editor.
   */
  createExternalPlugins(): ProsemirrorPlugin[] {
    const plugins = [tableEditing(), newTableDeleteStatePlugin()];

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
        previewSelectionTable: { default: false },
        previewSelectionColumn: { default: -1 },
        previewSelectionRow: { default: -1 },
        insertionButtonAttrs: { default: null },
        deleteButtonAttrs: { default: null },
      },
      content: 'tableControllerRow? tableRow+',
      tableRole: 'table',
      parseDOM: [{ tag: 'table', getAttrs: extra.parse }],
      toDOM(node) {
        return ['table', ['tbody', extra.dom(node), 0]];
      },
    };
    console.debug(`[TableView.createNodeSpec]`, spec);
    return spec;
  }

  createExtensions() {
    return [];
  }

  /**
   * Create a table in the editor at the current selection point.
   */
  @command(createTableCommand)
  createTable(options: CreateTableCommand = {}): CommandFunction {
    return (props) => {
      const { tr, dispatch, state } = props;

      if (!tr.selection.empty) {
        return false;
      }

      const offset = tr.selection.anchor + 1;
      const nodes = createTable({ schema: state.schema, ...options });

      dispatch?.(
        tr
          .replaceSelectionWith(nodes)
          .scrollIntoView()
          .setSelection(TextSelection.near(tr.doc.resolve(offset))),
      );

      return true;
    };
  }
}

@extension({ defaultPriority: ExtensionPriority.Low })
export class TableRowExtension extends RemirrorTableRowExtension {
  get name() {
    return 'tableRow' as const;
  }

  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): TableSchemaSpec {
    const spec = super.createNodeSpec(extra, override);
    console.log('spec:', spec);
    spec.content = 'tableControllerCell? (tableCell | tableHeaderCell)*';
    spec.toDOM = (node) => {
      return ['tr', extra.dom(node), 0];
    };
    return spec;
  }

  createExtensions() {
    return [];
  }
}

@extension({ defaultPriority: ExtensionPriority.Low })
export class TableControllerRowExtension extends NodeExtension {
  get name() {
    return 'tableControllerRow' as const;
  }

  createExtensions() {
    return [];
  }

  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): NodeExtensionSpec {
    return {
      attrs: extra.defaults(),
      content: '(tableControllerCell)*',
      // tableRole: 'controllerRow',
      parseDOM: [{ tag: 'tr', getAttrs: extra.parse }],
      toDOM(node) {
        return ['tr', extra.dom(node), 0];
      },
    };
  }
}

@extension({ defaultPriority: ExtensionPriority.Low })
export class TableHeaderCellExtension extends RemirrorTableHeaderCellExtension {
  get name() {
    return 'tableHeaderCell' as const;
  }

  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): TableSchemaSpec {
    const spec = super.createNodeSpec(extra, override);
    spec.attrs = {
      ...spec.attrs,
    };
    return spec;
  }

  createExtensions() {
    return [];
  }
}

@extension({ defaultPriority: ExtensionPriority.Low })
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
};

@extension({ defaultPriority: ExtensionPriority.Low })
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

  createExtensions() {
    return [];
  }
}
