import { FindProsemirrorNodeResult } from '@remirror/core';

export type FindTable = () => FindProsemirrorNodeResult | undefined;
export type FindTableCellIndex = () => { row: number; col: number };
