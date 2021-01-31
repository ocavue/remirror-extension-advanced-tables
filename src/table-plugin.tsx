import { CreatePluginReturn, EditorState, EditorView, findParentNodeOfType } from '@remirror/core';
import { Node as ProsemirrorNode } from '@remirror/pm/model';
import { Decoration, DecorationSet } from '@remirror/pm/view';
import { TableView } from './table-view';

export type TableContollerPluginState = { debugCounter: number; tableNode?: ProsemirrorNode };

export function newTableContollerPlugin(): CreatePluginReturn<TableContollerPluginState> {
  return {
    /*
        state: {
            init: (config, state): TableContollerPluginState => {
                console.debug(`[TableContollerPlugin.init]`)
                return { debugCounter: 0 }
            },
            apply: (tr, oldPluginState, oldEditorState, newEditorState): TableContollerPluginState => {
                return newPluginState
            },
        },
        */

    props: {
      nodeViews: {
        table: (node: ProsemirrorNode, view: EditorView, getPos: boolean | (() => number), decorations: Decoration[]) => {
          return new TableView(node, 10, decorations, view);
        },
      },

      handleDOMEvents: {
        mousedown: () => {
          console.debug(`[TableContollerPlugin.mousedown]`);
          return false;
        },
      },

      decorations: (state: EditorState) => {
        const tableNodeResult = findParentNodeOfType({
          types: 'table',
          selection: state.selection,
        });

        console.debug(`[TableContollerPlugin.decorations] tableNodeResult: ${tableNodeResult?.start}-${tableNodeResult?.end}`);
        if (tableNodeResult) {
          const decoration = Decoration.node(
            tableNodeResult.start - 1, // Not sure why do I need '-1' here.
            tableNodeResult.end,
            { class: 'remirror-table-controller-wrapper--show-controllers' },
          );

          console.debug(`[TableContollerPlugin.decorations] creating decorations:`, decoration);
          return DecorationSet.create(state.doc, [decoration]);
        }

        return null;
      },
    },
  };
}
