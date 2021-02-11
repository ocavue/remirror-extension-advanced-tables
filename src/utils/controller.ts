import { EditorView, Transaction } from '@remirror/core';
import { Fragment, Node as ProsemirrorNode } from '@remirror/pm/model';
import { Selection } from 'prosemirror-state';
import { CellSelection, TableMap } from 'prosemirror-tables';
import { ControllerType } from '../const';
import { Events } from '../utils/jsx';
import { setNodeAttrs } from '../utils/prosemirror';
import { repeat } from './array';
import { CellAxis } from './types';

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

  let pos = getPos();
  return tr.replaceRangeWith(pos, pos + oldTable.nodeSize, newTable);
}

export function newControllerEvents({
  controllerType,
  view,
  getTablePos: getPos,
  getMap,
  getAxis,
}: {
  controllerType: ControllerType;
  view: EditorView;
  getTablePos: () => number;
  getMap: () => TableMap;
  getAxis: () => CellAxis;
}): Events {
  if (controllerType === ControllerType.ROW_CONTROLLER)
    return {
      onClick: () => selectRow(view, getPos(), getMap(), getAxis().row),
      onMouseOver: () => previewSelectRow(view, getPos(), getMap(), getAxis().row),
      onMouseOut: () => previewLeaveRow(view, getPos(), getMap(), getAxis().row),
    };
  else if (controllerType === ControllerType.COLUMN_CONTROLLER)
    return {
      onClick: () => selectColumn(view, getPos(), getMap(), getAxis().col),
      onMouseOver: () => previewSelectColumn(view, getPos(), getAxis().col),
      onMouseOut: () => previewLeaveColumn(view, getPos()),
    };
  else
    return {
      onClick: () => selectTable(view, getPos(), getMap()),
      onMouseOver: () => previewSelectTable(view, getPos()),
      onMouseOut: () => previewLeaveTable(view, getPos()),
    };
}

function selectRow(view: EditorView, tablePos: number, map: TableMap, rowIndex: number) {
  const cellIndex = getCellIndex(map, rowIndex, 0);
  let tr = view.state.tr;
  const posInTable = map.map[cellIndex + 1];
  const pos = tablePos + posInTable + 1;
  const $pos = tr.doc.resolve(pos);
  const selection = CellSelection.rowSelection($pos);
  tr = tr.setSelection((selection as unknown) as Selection); // TODO: https://github.com/ProseMirror/prosemirror-tables/pull/126
  view.dispatch(tr);
}

function selectColumn(view: EditorView, tablePos: number, map: TableMap, colIndex: number) {
  const cellIndex = getCellIndex(map, 0, colIndex);
  let tr = view.state.tr;
  const posInTable = map.map[cellIndex];
  const pos = tablePos + posInTable + 1;
  const $pos = tr.doc.resolve(pos);
  const selection = CellSelection.colSelection($pos);
  tr = tr.setSelection((selection as unknown) as Selection);
  view.dispatch(tr);
}

function selectTable(view: EditorView, tablePos: number, map: TableMap) {
  if (map.map.length > 0) {
    let tr = view.state.tr;
    const firstCellPosInTable = map.map[0];
    const lastCellPosInTable = map.map[map.map.length - 1];
    const firstCellPos = tablePos + firstCellPosInTable + 1;
    const lastCellPos = tablePos + lastCellPosInTable + 1;
    const $firstCellPos = tr.doc.resolve(firstCellPos);
    const $lastCellPos = tr.doc.resolve(lastCellPos);
    const selection = new CellSelection($firstCellPos, $lastCellPos);
    tr = tr.setSelection((selection as unknown) as Selection);
    view.dispatch(tr);
  }
}

function previewSelectRow(view: EditorView, tablePos: number, map: TableMap, rowIndex: number) {
  const posInTable = map.map[getCellIndex(map, rowIndex, 0)];
  const rowPos = tablePos + posInTable;
  view.dispatch(setNodeAttrs(view.state.tr, rowPos, { previewSelection: true }));
}

function previewLeaveRow(view: EditorView, tablePos: number, map: TableMap, rowIndex: number) {
  const posInTable = map.map[getCellIndex(map, rowIndex, 0)];
  const rowPos = tablePos + posInTable;
  view.dispatch(setNodeAttrs(view.state.tr, rowPos, { previewSelection: false }));
}

function previewSelectColumn(view: EditorView, tablePos: number, columnIndex: number) {
  view.dispatch(setNodeAttrs(view.state.tr, tablePos, { previewSelectionColumn: columnIndex }));
}
function previewLeaveColumn(view: EditorView, tablePos: number) {
  view.dispatch(setNodeAttrs(view.state.tr, tablePos, { previewSelectionColumn: -1 }));
}

function previewSelectTable(view: EditorView, tablePos: number) {
  view.dispatch(setNodeAttrs(view.state.tr, tablePos, { previewSelection: true }));
}
function previewLeaveTable(view: EditorView, tablePos: number) {
  view.dispatch(setNodeAttrs(view.state.tr, tablePos, { previewSelection: false }));
}

function getCellIndex(map: TableMap, rowIndex: number, colIndex: number): number {
  return map.width * rowIndex + colIndex;
}

export function getControllerType(cellAxis: CellAxis): ControllerType {
  if (cellAxis.row > 0) return ControllerType.ROW_CONTROLLER;
  else if (cellAxis.col > 0) return ControllerType.COLUMN_CONTROLLER;
  else return ControllerType.CORNER_CONTROLLER;
}
