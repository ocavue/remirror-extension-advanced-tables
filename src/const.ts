export const enum ControllerType {
  ROW_CONTROLLER = 1,
  COLUMN_CONTROLLER = 2,
  CORNER_CONTROLLER = 3,
}

export const enum ClassName {
  TABLE = 'remirror-table',
  TABLE_SHOW_CONTROLLERS = 'remirror-table--show-controllers',
  TBODY = 'remirror-table-tbody',
  COL_GROUP = 'remirror-table-colgroup',

  TABLE_CONTROLLER = 'remirror-table-controller',

  // provided by prosemirror-tables
  SELECTED_CELL = 'selectedCell',
  COLUMN_RESIZE_HANDLE = 'column-resize-handle',
}
