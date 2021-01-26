import {
    TableCellExtension as RemirrorTableCellExtension,
    TableExtension as RemirrorTableExtension,
    TableHeaderCellExtension as RemirrorTableHeaderCellExtension,
    TableRowExtension as RemirrorTableRowExtension
} from "@remirror/preset-table"

export class TableExtension extends RemirrorTableExtension {
    get name() {
        return "table" as const
    }
}

export class TableRowExtension extends RemirrorTableRowExtension {
    get name() {
        return "tableRow" as const
    }
}

export class TableHeaderExtension extends RemirrorTableHeaderCellExtension {
    get name() {
        return "tableHeaderCell" as const
    }
}

export class TableCellExtension extends RemirrorTableCellExtension {
    get name() {
        return "tableCell" as const
    }
}


