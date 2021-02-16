import { EditorView, ResolvedPos, Transaction } from '@remirror/core';
import { Fragment, Node as ProsemirrorNode } from '@remirror/pm/model';
import { CellSelection, TableMap } from 'prosemirror-tables';
import { ControllerType } from '../const';
import { TableNodeAttrs } from '../table-extension';
import { Events } from '../utils/jsx';
import { cellSelectionToSelection, setNodeAttrs } from '../utils/prosemirror';
import { repeat } from './array';
import { CellAxis, FindTable } from './types';

export function injectControllers({
  view,
  getMap,
  getPos,
  tr,
  oldTable,
}: {
  view: EditorView;
  getMap: () => TableMap;
  getPos: () => number;
  tr: Transaction;
  oldTable: ProsemirrorNode;
}) {
  let schema = view.state.schema;
  let controllerCell = view.state.schema.nodes.tableControllerCell.create();
  const headerControllerCells: ProsemirrorNode[] = repeat(controllerCell, getMap().width + 1);

  const crotrollerRow: ProsemirrorNode = schema.nodes.tableRow.create({}, headerControllerCells);
  const newRowsArray: ProsemirrorNode[] = [crotrollerRow];

  const oldRows = oldTable.content;
  oldRows.forEach((oldRow) => {
    const oldCells = oldRow.content;
    const newCells = Fragment.from(controllerCell).append(oldCells);
    const newRow = oldRow.copy(newCells);
    newRowsArray.push(newRow);
  });

  const newRows = Fragment.fromArray(newRowsArray);
  const newTable = oldTable.copy(newRows);

  (newTable.attrs as TableNodeAttrs).isControllersInjected = true;

  let pos = getPos();
  return tr.replaceRangeWith(pos, pos + oldTable.nodeSize, newTable);
}

export function newControllerEvents({
  controllerType,
  view,
  findTable,
  getAxis,
}: {
  controllerType: ControllerType;
  view: EditorView;
  findTable: FindTable;
  getAxis: () => CellAxis;
}): Events {
  if (controllerType === ControllerType.ROW_CONTROLLER)
    return {
      onClick: () => selectRow(view, findTable, getAxis().row),
      onMouseOver: () => previewSelectRow(view, findTable, getAxis().row),
      onMouseOut: () => previewLeaveRow(view, findTable, getAxis().row),
    };
  else if (controllerType === ControllerType.COLUMN_CONTROLLER)
    return {
      onClick: () => selectColumn(view, findTable, getAxis().col),
      onMouseOver: () => previewSelectColumn(view, findTable, getAxis().col),
      onMouseOut: () => previewLeaveColumn(view, findTable, getAxis().col),
    };
  else
    return {
      onClick: () => selectTable(view, findTable, 0),
      onMouseOver: () => previewSelectTable(view, findTable, 0),
      onMouseOut: () => previewLeaveTable(view, findTable, 0),
    };
}

function decoExecFunc(func: (view: EditorView, tablePos: number, map: TableMap, index: number) => void) {
  return (view: EditorView, findTable: FindTable, index: number) => {
    let found = findTable();
    if (!found) return;
    let tablePos = found.pos;
    let map = TableMap.get(found.node);
    return func(view, tablePos, map, index);
  };
}

const selectRow = decoExecFunc((view: EditorView, tablePos: number, map: TableMap, index: number) => {
  const cellIndex = getCellIndex(map, index, 0);
  let tr = view.state.tr;
  const posInTable = map.map[cellIndex + 1];
  const pos = tablePos + posInTable + 1;
  const $pos = tr.doc.resolve(pos);
  const selection = CellSelection.rowSelection($pos);
  tr = tr.setSelection(cellSelectionToSelection(selection));
  view.dispatch(tr);
});

const selectColumn = decoExecFunc((view: EditorView, tablePos: number, map: TableMap, index: number) => {
  const cellIndex = getCellIndex(map, 0, index);
  let tr = view.state.tr;
  const posInTable = map.map[cellIndex];
  const pos = tablePos + posInTable + 1;
  const $pos = tr.doc.resolve(pos);
  const selection = CellSelection.colSelection($pos);
  tr = tr.setSelection(cellSelectionToSelection(selection));
  view.dispatch(tr);
});

const selectTable = decoExecFunc((view: EditorView, tablePos: number, map: TableMap, index: number) => {
  if (map.map.length > 0) {
    let tr = view.state.tr;
    const firstCellPosInTable = map.map[0];
    const lastCellPosInTable = map.map[map.map.length - 1];
    const firstCellPos = tablePos + firstCellPosInTable + 1;
    const lastCellPos = tablePos + lastCellPosInTable + 1;
    const $firstCellPos = tr.doc.resolve(firstCellPos);
    const $lastCellPos = tr.doc.resolve(lastCellPos);
    const selection = new CellSelection($firstCellPos, $lastCellPos);
    tr = tr.setSelection(cellSelectionToSelection(selection));
    view.dispatch(tr);
  }
});

const previewSelectRow = decoExecFunc((view: EditorView, tablePos: number, map: TableMap, index: number) => {
  const posInTable = map.map[getCellIndex(map, index, 0)];
  const rowPos = tablePos + posInTable;
  view.dispatch(setNodeAttrs(view.state.tr, rowPos, { previewSelection: true }));
});

const previewLeaveRow = decoExecFunc((view: EditorView, tablePos: number, map: TableMap, index: number) => {
  const posInTable = map.map[getCellIndex(map, index, 0)];
  const rowPos = tablePos + posInTable;
  view.dispatch(setNodeAttrs(view.state.tr, rowPos, { previewSelection: false }));
});

const previewSelectColumn = decoExecFunc((view: EditorView, tablePos: number, map: TableMap, index: number) => {
  view.dispatch(setNodeAttrs(view.state.tr, tablePos, { previewSelectionColumn: index }));
});
const previewLeaveColumn = decoExecFunc((view: EditorView, tablePos: number, map: TableMap, index: number) => {
  view.dispatch(setNodeAttrs(view.state.tr, tablePos, { previewSelectionColumn: -1 }));
});

const previewSelectTable = decoExecFunc((view: EditorView, tablePos: number, map: TableMap, index: number) => {
  view.dispatch(setNodeAttrs(view.state.tr, tablePos, { previewSelection: true }));
});
const previewLeaveTable = decoExecFunc((view: EditorView, tablePos: number, map: TableMap, index: number) => {
  view.dispatch(setNodeAttrs(view.state.tr, tablePos, { previewSelection: false }));
});

function getCellIndex(map: TableMap, rowIndex: number, colIndex: number): number {
  return map.width * rowIndex + colIndex;
}

export function getControllerType(cellAxis: CellAxis): ControllerType {
  if (cellAxis.row > 0) return ControllerType.ROW_CONTROLLER;
  else if (cellAxis.col > 0) return ControllerType.COLUMN_CONTROLLER;
  else return ControllerType.CORNER_CONTROLLER;
}

export function getCellAxis($cellPos: ResolvedPos): CellAxis {
  return { col: $cellPos.index(-1), row: $cellPos.index(-2) };
}

export const enum CellSelectionType {
  row = 1,
  col = 2,
  table = 3,
  other = 4,
}

export function getCellSelectionType(selection: CellSelection): CellSelectionType {
  if (selection.isRowSelection()) {
    if (selection.isColSelection()) {
      return CellSelectionType.table;
    } else {
      return CellSelectionType.row;
    }
  } else if (selection.isColSelection()) {
    return CellSelectionType.col;
  }
  return CellSelectionType.other;
}
