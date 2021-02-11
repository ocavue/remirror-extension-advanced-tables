import { EditorView, range, Transaction } from '@remirror/core';
import { Fragment, Node as ProsemirrorNode } from '@remirror/pm/model';
import { Selection } from 'prosemirror-state';
import { CellSelection, TableMap } from 'prosemirror-tables';
import { ControllerType } from '../const';
import { Events } from '../utils/jsx';
import { setNodeAttrs } from '../utils/prosemirror';

export function injectControllers(
  tr: Transaction,
  oldTable: ProsemirrorNode,
  map: TableMap,
  getPos: () => number,
  view: EditorView,
): Transaction {
  let schema = view.state.schema;

  const headerControllerCells: ProsemirrorNode[] = range(map.width + 1).map((i) => {
    if (i === 0) {
      let events: Events = {
        onClick: () => selectTable(view, getPos(), map),
        onMouseOver: () => previewSelectTable(view, getPos()),
        onMouseOut: () => previewLeaveTable(view, getPos()),
      };
      return schema.nodes.tableControllerCell.create({ controllerType: ControllerType.CORNER_CONTROLLER, events });
    } else {
      let events: Events = {
        onClick: () => selectColumn(view, getPos(), map, i),
        onMouseOver: () => previewSelectColumn(view, getPos(), i),
        onMouseOut: () => previewLeaveColumn(view, getPos()),
      };
      return schema.nodes.tableControllerCell.create({ controllerType: ControllerType.COLUMN_CONTROLLER, events });
    }
  });

  const crotrollerRow: ProsemirrorNode = schema.nodes.tableRow.create({}, headerControllerCells);
  const newRowsArray: ProsemirrorNode[] = [crotrollerRow];

  const oldRows = oldTable.content;
  oldRows.forEach((oldRow, _, index) => {
    let events: Events = {
      onClick: () => selectRow(view, getPos(), map, index + 1),
      onMouseOver: () => previewSelectRow(view, getPos(), map, index + 1),
      onMouseOut: () => previewLeaveRow(view, getPos(), map, index + 1),
    };
    const controllerCell = schema.nodes.tableControllerCell.create({ controllerType: ControllerType.ROW_CONTROLLER, events });
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
