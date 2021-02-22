import { CreateExtensionPlugin, EditorState, findParentNodeOfType, Transaction } from '@remirror/core';
import { Plugin, PluginKey } from '@remirror/pm/state';
import { Decoration, DecorationSet } from '@remirror/pm/view';
import { CellSelection } from 'prosemirror-tables';
import { ClassName } from './const';
import { TableNodeAttrs } from './table-extension';
import { getCellSelectionType } from './utils/controller';
import { cellSelectionToSelection, setNodeAttrs } from './utils/prosemirror';

export function newTableDecorationPlugin(): CreateExtensionPlugin {
  return {
    props: {
      decorations: (state: EditorState) => {
        const tableNodeResult = findParentNodeOfType({
          types: 'table',
          selection: state.selection,
        });

        if (tableNodeResult) {
          const decorations = [
            Decoration.node(tableNodeResult.pos, tableNodeResult.end, {
              class: ClassName.TABLE_SHOW_CONTROLLERS,
            }),
          ];
          return DecorationSet.create(state.doc, decorations);
        }

        return null;
      },
    },
  };
}

export const key = new PluginKey('tablePreviewDelete');

type TableDeletePluginState = {
  showButton: boolean;
};

// TODO: merge two plgins
export function newTableDeleteStatePlugin(): Plugin<TableDeletePluginState> {
  let plugin = new Plugin({
    key,
    // state: {
    //   init: (): TableDeletePluginState => {
    //     return { showButton: false };
    //   },
    //   apply: (tr: Transaction, state: TableDeletePluginState): TableDeletePluginState => {
    //     return state;
    //   },
    // },

    // TODO: move to a function
    appendTransaction: (trs: Transaction[], oldState: EditorState, newState: EditorState): Transaction | void => {
      // If the selection doesn't change, then the state of delete button shouldn't change.
      if (oldState.selection.eq(newState.selection)) return;

      // If the selection is a CellSelection instance, then we add selection information into the table node.
      if (newState.selection instanceof CellSelection && !newState.selection.empty) {
        let selection: CellSelection = newState.selection;
        let tableResult = findParentNodeOfType({ selection: cellSelectionToSelection(selection), types: 'table' });
        if (!tableResult) return;
        let attrs: Partial<TableNodeAttrs> = {
          deleteButtonAttrs: {
            selectionType: getCellSelectionType(selection),
            selectionHeadCellPos: selection.$headCell.pos,
            selectionAnchorCellPos: selection.$anchorCell.pos,
          },
        };
        return setNodeAttrs(newState.tr, tableResult.pos, attrs, tableResult.node);
      }

      // If the selection is not a CellSelection instance but inside a table, then we remove selection information from the table node.
      let tableResult = findParentNodeOfType({ selection: newState.selection, types: 'table' });
      if (tableResult) {
        let attrs: Partial<TableNodeAttrs> = {
          deleteButtonAttrs: null,
        };
        return setNodeAttrs(newState.tr, tableResult.pos, attrs, tableResult.node);
      }

      // If the selection is not inside a table, the delete button show be hidden by CSS. So we don't need to do anything manually.
    },
  });
  return plugin;
}
