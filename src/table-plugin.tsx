import { CreatePluginReturn, EditorState, findParentNodeOfType, Transaction } from '@remirror/core';
import { Plugin, PluginKey } from '@remirror/pm/state';
import { Decoration, DecorationSet } from '@remirror/pm/view';
import { CellSelection } from 'prosemirror-tables';
import { TableNodeAttrs } from './table-extension';
import { getCellAxis, getCellSelectionType } from './utils/controller';
import { cellSelectionToSelection, setNodeAttrs } from './utils/prosemirror';

export function newTableDecorationPlugin(): CreatePluginReturn {
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
              class: 'remirror-table-controller-wrapper--show-controllers',
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

/**
 * 方案：
 * 由 plugin.appendTransaction 去过滤每一个 tr：
 *    如果这个 tr 中包含对 selection 的变动（TODO：如何做到）
 *    如果这个 selection 就是 CellSelection，而且 isRowSelection 或者 isColSelection
 *    增加一个 tr，给 table 增加属性：属性中包含选择的行/列的 index 范围
 * table 在收到属性后，由 decoration 增加一个按钮。
 */

type TableDeletePluginState = {
  showButton: boolean;
};

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
    appendTransaction: (trs: Transaction[], oldState: EditorState, newState: EditorState): Transaction | void => {
      // If the selection doesn't change, then the state of delete button shouldn't change.
      if (oldState.selection.eq(newState.selection)) return;

      // If the selection is a CellSelection instance, then we add selection information into the table node.
      if (newState.selection instanceof CellSelection && !newState.selection.empty) {
        let selection: CellSelection = newState.selection;
        let tableResult = findParentNodeOfType({ selection: cellSelectionToSelection(selection), types: 'table' });
        if (!tableResult) return;
        let attrs: Partial<TableNodeAttrs> = {
          selectionType: getCellSelectionType(selection),
          // Notice that `selection.$headCell` and `selection.$anchorCell` are resolved positions pointing **in front of** the head cell and anchor cell.
          // That means in order to get the actual position of cells, we need to +1.
          selectionHeadAxis: getCellAxis(newState.doc.resolve(selection.$headCell.pos + 1)),
          selectionAnchorAxis: getCellAxis(newState.doc.resolve(selection.$anchorCell.pos + 1)),
        };
        return setNodeAttrs(newState.tr, tableResult.pos, attrs, tableResult.node);
      }

      // If the selection is not a CellSelection instance but inside a table, then we remove selection information from the table node.
      let tableResult = findParentNodeOfType({ selection: newState.selection, types: 'table' });
      if (tableResult) {
        let attrs: Partial<TableNodeAttrs> = {
          selectionType: null,
          selectionHeadAxis: null,
          selectionAnchorAxis: null,
        };
        return setNodeAttrs(newState.tr, tableResult.pos, attrs, tableResult.node);
      }

      // If the selection is not inside a table, the delete button show be hidden by CSS. So we don't need to do anything manually.
    },
  });
  return plugin;
}
