import { FindProsemirrorNodeResult } from '@remirror/core';

export type FindTable = () => FindProsemirrorNodeResult | undefined;
export type CellAxis = { row: number; col: number };
