import { findParentNodeOfType, FindProsemirrorNodeResult, Selection } from '@remirror/core';
import { useRemirror } from '@remirror/react';
import { CellSelection } from 'prosemirror-tables';
import React, { useEffect, useRef, useState } from 'react';

export type TablePos = {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
  display?: 'none';
};
export type TablePosWithRef<RefType extends HTMLDivElement> = TablePos & {
  ref: React.RefObject<RefType> | null;
};

const defaultPositionState: TablePos = { top: -999999, left: -999999, right: 999999, bottom: -999999 };
//#region  DEBUG Only
// function CreateElement(top, left, right, bottom, text, color?): HTMLDivElement {
//   let startTop = document.createElement('div');
//   startTop.style.border = `2px solid ${color || 'red'}`;
//   startTop.style.position = 'absolute';
//   startTop.style.top = top;
//   startTop.style.left = left;
//   startTop.style.right = right;
//   startTop.style.bottom = bottom;
//   // startTop.style.width = '50';
//   // startTop.style.height = '50';

//   document.body.append(startTop);
//   return startTop;
// }

// let startRect = CreateElement(undefined, undefined, undefined, undefined, 'start');
// let endRect = CreateElement(undefined, undefined, undefined, undefined, 'end', 'blue');
// let parentRect = CreateElement(undefined, undefined, undefined, undefined, 'end', 'green');
//#endregion

function findTableCell(selection: Selection, blockTypes: string[]): FindProsemirrorNodeResult | undefined | null {
  if (selection instanceof CellSelection && selection.$anchorCell.pos !== selection.$headCell.pos) {
    return null;
  }
  return findParentNodeOfType({ selection: selection, types: blockTypes });
}

export function useBlockPositioner<RefType extends HTMLDivElement>(blockTypes: string[]): TablePosWithRef<RefType> {
  const { addHandler } = useRemirror();
  const [tablePos, setTablePos] = useState<TablePos>(defaultPositionState);
  const ref = useRef<RefType>(null);

  useEffect(() => {
    const unsub = addHandler('updated', ({ state, view }) => {
      const node = findTableCell(state.selection, blockTypes);

      if (node) {
        const node = findParentNodeOfType({ selection: state.selection, types: blockTypes });
        if (!node) return;

        const { top, left } = view.coordsAtPos(node.start);
        let { bottom, right, left: leftEnd } = view.coordsAtPos(node.end);
        // {
        //   let { top, left, right, bottom } = view.coordsAtPos(node.start);
        //   console.log('unsub -> view.coordsAtPos(node.start)', view.coordsAtPos(node.start));
        //   startRect.style.top = `${top}px`;
        //   startRect.style.left = `${left}px`;
        //   startRect.style.width = `${right - left}px`;
        //   startRect.style.height = `${bottom - top}px`;
        // }
        // {
        //   let { top, left, right, bottom } = view.coordsAtPos(node.end);
        //   console.log('unsub -> view.coordsAtPos(node.end)', view.coordsAtPos(node.end));
        //   endRect.style.top = `${top}px`;
        //   endRect.style.left = `${left}px`;
        //   endRect.style.width = `${right - left}px`;
        //   endRect.style.height = `${bottom - top}px`;
        // }

        const element = ref.current;
        const parent = element?.offsetParent;
        if (!parent) {
          setTablePos(defaultPositionState);
          return;
        }

        // Fix for Table Cells... cause theire weird
        if (['tableCell', 'tableHeaderCell'].includes(node.node.type.name)) right = leftEnd;
        const parentBox = parent.getBoundingClientRect();

        setTablePos({
          left: Math.trunc(left - parentBox.left),
          top: Math.trunc(top - parentBox.top),
          right: Math.trunc(parentBox.right - right),
          bottom: Math.trunc(bottom - parentBox.top),
        });
      } else {
        setTablePos(defaultPositionState);
      }
    });
    return () => {
      unsub();
    };
  }, [blockTypes, addHandler]);
  return {
    ...tablePos,
    ref,
  };
}
