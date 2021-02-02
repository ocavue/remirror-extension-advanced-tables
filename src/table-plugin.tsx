import { CreatePluginReturn, EditorState, findParentNodeOfType } from '@remirror/core';
import { Node as ProsemirrorNode } from '@remirror/pm/model';
import { Decoration, DecorationSet } from '@remirror/pm/view';

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
      /*
      handleDOMEvents: {
        mousedown: () => {
          console.debug(`[TableContollerPlugin.mousedown]`);
          return false;
        },
      },
      */

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
          return DecorationSet.create(state.doc, [decoration]);
        }

        return null;
      },
    },
  };
}
