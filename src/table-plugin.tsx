import { CreatePluginReturn, EditorState, EditorView, findParentNodeOfType } from '@remirror/core';
import { Node as ProsemirrorNode } from '@remirror/pm/model';
import { Decoration, DecorationSet } from '@remirror/pm/view';
import { h } from 'jsx-dom/min';
import type { TableNodeAttrs } from './table-extension';

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

        if (tableNodeResult) {
          const decorations = [
            Decoration.node(
              tableNodeResult.start - 1, // Not sure why do I need '-1' here.
              tableNodeResult.end,
              { class: 'remirror-table-controller-wrapper--show-controllers' },
            ),
          ];

          let attrs = tableNodeResult.node.attrs as TableNodeAttrs;

          if (attrs.insertionButtonAttrs) {
            let buttonAttrs = attrs.insertionButtonAttrs;
            let toDOM = (view: EditorView, getPos: () => number) => {
              return h(
                'button',
                {
                  style: {
                    width: '24px',
                    height: '24px',
                    position: 'absolute',
                    top: `${buttonAttrs.x}px`,
                    left: `${buttonAttrs.y}px`,
                  },
                  onClick: () => {
                    console.log(attrs);
                  },
                },
                '+',
              );
            };
            decorations.push(Decoration.widget(tableNodeResult.end, toDOM));
          }

          return DecorationSet.create(state.doc, decorations);
        }

        return null;
      },
    },
  };
}
