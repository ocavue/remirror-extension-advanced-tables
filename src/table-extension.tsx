import React from 'react';
import {
  ApplySchemaAttributes,
  CreatePluginReturn,
  Decoration,
  EditorView,
  NodeExtension,
  NodeExtensionSpec,
  NodeViewMethod,
  ProsemirrorNode,
  ProsemirrorPlugin,
} from '@remirror/core';
import { NodeViewComponentProps } from '@remirror/extension-react-component';
import {
  TableCellExtension as RemirrorTableCellExtension,
  TableExtension as RemirrorTableExtension,
  TableHeaderCellExtension as RemirrorTableHeaderCellExtension,
  TableRowExtension as RemirrorTableRowExtension,
} from '@remirror/preset-table';
import { TableSchemaSpec } from '@remirror/preset-table/dist/declarations/src/table-utils';
import { tableEditing } from 'prosemirror-tables';
import { ComponentType } from 'react';
import { TableControllerCellView } from './controller/table-controller-cell-view';
import { columnResizing } from './table-column-resizing';
import { newTableContollerPlugin, TableContollerPluginState } from './table-plugin';
import { TableView } from './table-view';

export type TableNodeAttrs<T extends Record<string, any> = Record<never, never>> = T & {
  isControllersInjected: boolean;
  previewSelection: boolean;
  previewSelectionColumn: number;
  showInsertionButton: number;
};

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
        previewSelection: { default: false },
        previewSelectionColumn: { default: -1 },
        showInsertionButton: { default: true }, // TODO: change the default value to false
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

      controllerType: { default: false },

      events: { default: null },
    };

    return {
      isolating: true,
      content: `block*`,
      attrs: cellAttrs,
      tableRole: 'header_cell',
      toDOM(node) {
        return ['th', 0];
      },
    };
  }

  createNodeViews = (): NodeViewMethod => {
    return (node: ProsemirrorNode, view: EditorView, getPos: boolean | (() => number), decorations: Decoration[]) => {
      return new TableControllerCellView(node, view, getPos as () => number, decorations);
    };
  };
}

export class TableInsertionHandlerExtension extends NodeExtension {
  get name() {
    return 'tableInsertionHandler' as const;
  }

  createNodeSpec(extra: ApplySchemaAttributes): NodeExtensionSpec {
    return {
      toDOM(node) {
        return ['div', 0];
      },
    };
  }

  ReactComponent: ComponentType<NodeViewComponentProps> = (props) => {
    return <div>Ignore content</div>;
  };
}
