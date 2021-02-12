import { CreatePluginReturn, EditorState, EditorView, findParentNodeOfType } from '@remirror/core';
import { Node as ProsemirrorNode } from '@remirror/pm/model';
import { Decoration, DecorationSet } from '@remirror/pm/view';
import { TableMap } from 'prosemirror-tables';
import TableInsertionButton from './components/TableInsertionButton';
import type { TableNodeAttrs } from './table-extension';

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
            Decoration.node(
              tableNodeResult.start - 1, // Not sure why do I need '-1' here.
              tableNodeResult.end,
              { class: 'remirror-table-controller-wrapper--show-controllers' },
            ),
          ];

          const attrs = (tableNodeResult.node.attrs as TableNodeAttrs).insertionButtonAttrs;

          if (attrs) {
            let toDOM = (view: EditorView, getPos: () => number) => {
              return TableInsertionButton({
                view,
                attrs,
                tableRect: {
                  map: TableMap.get(tableNodeResult.node),
                  table: tableNodeResult.node,
                  tableStart: tableNodeResult.start,

                  // The following properties are not actually used
                  left: 0,
                  top: 0,
                  right: 0,
                  bottom: 0,
                },
              });
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
