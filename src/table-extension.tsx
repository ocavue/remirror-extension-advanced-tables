import { ApplySchemaAttributes, CreatePluginReturn, EditorState, EditorView, findParentNodeOfType, NodeView, Selection } from '@remirror/core';
import type { ClickHandler, ClickHandlerState, CreateEventHandlers } from '@remirror/extension-events';
import { Node as ProsemirrorNode } from '@remirror/pm/model';
import { Decoration, DecorationSet } from '@remirror/pm/view';
import {
    TableCellExtension as RemirrorTableCellExtension,
    TableExtension as RemirrorTableExtension,
    TableHeaderCellExtension as RemirrorTableHeaderCellExtension,
    TableRowExtension as RemirrorTableRowExtension
} from "@remirror/preset-table";
import { CellSelection, TableMap, updateColumnsOnResize } from 'prosemirror-tables';
import React from 'react';
import { h } from './utils/jsx';

const REMIRROR_EVENT_TABLE_CLICK_CALLBACK = "__remirrorTableClickEvent__"

const TableRowController: React.FC<{ tableHeight: number }> = ({ tableHeight }) => {
    return <div className="remirror-table-controller--row" style={{ height: `${tableHeight}px` }}>
        1
    </div>
}

const TableColController: React.FC<{ tableWidth: number }> = ({ tableWidth }) => {
    return <div className="remirror-table-controller--col" style={{ width: `${tableWidth}px` }}>
        2
    </div>
}

const TableCornerController: React.FC<{}> = ({ }) => {
    return <div className="remirror-table-corner-controller" style={{}}>
        3
    </div>
}


type ProsemirrorMutationRecord = MutationRecord | { type: 'selection'; target: Element }

export class TableView implements NodeView {
    root: HTMLElement
    tableMeasurer: HTMLElement
    table: HTMLTableElement
    colgroup: HTMLElement
    tbody: HTMLElement
    rowController: HTMLElement
    colController: HTMLElement
    cornerController: HTMLElement

    mounted: boolean = false

    get dom(): HTMLElement {
        return this.root
    }

    get contentDOM(): HTMLElement {
        return this.tbody
    }

    constructor(public node: ProsemirrorNode, public cellMinWidth: number, public decorations: Decoration[], public view: EditorView) {

        this.tbody = h('tbody', { 'class': "remirror-table-tbody" })
        this.colgroup = h('colgroup', { 'class': "remirror-table-colgroup" })
        this.table = h('table', { 'class': 'remirror-table' }, this.colgroup, this.tbody) as HTMLTableElement
        this.tableMeasurer = h('div', { 'class': 'remirror-table-measurer' }, this.table)

        this.rowController = h('div', { 'class': "remirror-table-controller__row", 'style': 'height: 100px' })
        this.colController = h('div', { 'class': "remirror-table-controller__col", 'style': 'width: 100px' })
        this.cornerController = h('div', { 'class': "remirror-table-controller__corner" })

        this.root = h(
            'div', { 'class': 'remirror-table-controller-wrapper' },

            this.rowController,
            this.colController,
            this.cornerController,
            this.tableMeasurer,
        )

        // TODO: add a event listener to detect `this.root` insertion
        // see also: https://davidwalsh.name/detect-node-insertion
        this.updateControllers(node)

        console.debug(`[TableView.constructor] decorations:`, this.decorations)

        updateColumnsOnResize(this.node, this.colgroup, this.table, this.cellMinWidth)
    }

    update(node: ProsemirrorNode, decorations: Decoration[]) {
        if (node.type != this.node.type) {
            return false
        }

        this.decorations = decorations
        this.node = node

        console.debug(`[TableView.update] decorations:`, this.decorations)
        updateColumnsOnResize(node, this.colgroup, this.table, this.cellMinWidth)
        this.updateControllers(node)
        return true
    }

    ignoreMutation(record: ProsemirrorMutationRecord) {
        return record.type == "attributes" && (record.target == this.table || this.colgroup.contains(record.target))
    }

    private updateControllers(node: ProsemirrorNode) {
        let size = this.getTableSize()
        console.debug(`[TableView.updateControllers] `, size)

        this.rowController.style.height = `${size.tableHeight}px`
        this.colController.style.width = `${size.tableWidth}px`

        const rowControllerCells: HTMLElement[] = size.rowHeights.map((height, index): HTMLElement => {
            let cell = h('div', { "class": "remirror-table-controller__row-cell", style: `height: ${height}px` }, `${index}`) as any;

            // TODO: register custom callback function. UGLY!
            cell[REMIRROR_EVENT_TABLE_CLICK_CALLBACK] = (tablePos: number) => {
                const [rowIndex, colIndex] = [index, 0]
                let map = TableMap.get(this.node)
                const cellIndex = map.width * rowIndex + colIndex;
                const posInTable = map.map[cellIndex + 1];
                console.debug(`[TableView.REMIRROR_EVENT_TABLE_CLICK_CALLBACK] posInTable:${posInTable} tablePos:${tablePos}`)
                const pos = tablePos + posInTable + 1
                let tr = this.view.state.tr
                const $pos = tr.doc.resolve(pos);
                console.debug(`[TableView.REMIRROR_EVENT_TABLE_CLICK_CALLBACK] pos: ${pos} $pos:`, $pos)
                let selection = CellSelection.rowSelection($pos) as unknown as Selection
                console.debug(`[TableView.REMIRROR_EVENT_TABLE_CLICK_CALLBACK] selection:`, selection)
                tr = tr.setSelection(selection)
                this.view.dispatch(tr)
                return 0
            }
            return cell
        })
        const colControllerCells: HTMLElement[] = size.colWidths.map((width, index): HTMLElement => {
            let cell = h('div', { "class": "remirror-table-controller__col-cell", style: `width: ${width}px` }, `${index}`)
            return cell
        })

        replaceChildren(this.rowController, rowControllerCells)
        replaceChildren(this.colController, colControllerCells)
    }

    private getTableSize() {
        let rect = this.table.getBoundingClientRect()

        return {
            tableHeight: rect.height,
            tableWidth: rect.width,
            rowHeights: getRowHeights(this.table),
            colWidths: getColWidths(this.table),
        }
    }
}

export function getRowHeights(table: HTMLTableElement) {
    const heights: number[] = [];

    if (table?.lastChild) {
        const rows = (table.lastChild).childNodes;

        for (let i = 0, count = rows.length; i < count; i++) {
            const row = rows[i] as HTMLTableRowElement;
            heights[i] = row.getBoundingClientRect().height + 1;
        }
    }

    return heights;
};

export function getColWidths(table: HTMLTableElement) {
    const widths: number[] = [];

    if (table?.lastChild?.lastChild) {
        const row = table.lastChild.lastChild as HTMLTableRowElement;
        const cells = row.childNodes

        for (let i = 0, count = cells.length; i < count; i++) {
            const cell = cells[i] as HTMLTableCellElement
            widths[i] = cell.getBoundingClientRect().width
        }
    }

    return widths;
};

// TODO: this function's performance should be very bad. Maybe we should use some kind of dom diff algorithm.
export function replaceChildren(container: HTMLElement, children: HTMLElement[]) {
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    for (let child of children) {
        container.appendChild(child)
    }
}

export type TableContollerPluginState = { debugCounter: number, tableNode?: ProsemirrorNode, }

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
            nodeViews: {
                'table': (node: ProsemirrorNode, view: EditorView, getPos: boolean | (() => number), decorations: Decoration[]) => {
                    return new TableView(node, 10, decorations, view)
                }
            },

            handleDOMEvents: {
                mousedown: () => {
                    console.debug(`[TableContollerPlugin.mousedown]`)
                    return false;
                },
            },

            decorations: (state: EditorState) => {

                let tableNodeResult = findParentNodeOfType({ types: 'table', selection: state.selection })

                console.debug(`[TableContollerPlugin.decorations] tableNodeResult: ${tableNodeResult?.start}-${tableNodeResult?.end}`)
                if (tableNodeResult) {


                    const decoration = Decoration.node(
                        tableNodeResult.start - 1, // Not sure why do I need '-1' here.
                        tableNodeResult.end,
                        { class: 'remirror-table-controller-wrapper--show-controllers' },
                    );

                    console.debug(`[TableContollerPlugin.decorations] creating decorations:`, decoration)
                    return DecorationSet.create(state.doc, [decoration])

                }

                return null
            },
        },
    };
}

export class TableExtension extends RemirrorTableExtension {
    get name() {
        return "table" as const
    }

    // createNodeViews = (): NodeViewMethod => {
    //     return (node: ProsemirrorNode, view: EditorView, getPos: boolean | (() => number), decorations: Decoration[]) => {
    //         const getPluginState = (): TableContollerPluginState => this.getPluginState(view.state)
    //         return new TableView(node, 10, getPluginState, decorations)
    //     }
    // }

    createPlugin(): CreatePluginReturn<TableContollerPluginState> {
        return newTableContollerPlugin()
    }

    createNodeSpec(extra: ApplySchemaAttributes) {
        let spec = super.createNodeSpec(extra)
        console.debug(`[TableView.createNodeSpec]`, spec)
        return spec
    }


    createEventHandlers(): CreateEventHandlers {
        const click: ClickHandler = (event: MouseEvent, clickState: ClickHandlerState) => {
            let nodeWithPosition = clickState.getNode('table')
            console.debug(`[TableView.click] nodeWithPosition:`, nodeWithPosition)
            if (nodeWithPosition) {
                let { node: tableNode, pos } = nodeWithPosition
                console.debug(`[TableView.click] tableNode:`, tableNode)
                let fn = event.target && (event.target as any)[REMIRROR_EVENT_TABLE_CLICK_CALLBACK]
                if (fn && typeof fn === 'function') {
                    console.debug(`[TableView.click] fn`)
                    fn(pos)
                }
            }
        }
        return { click }
    }

    /*
    createNodeSpec(extra: ApplySchemaAttributes) {
        let spec = super.createNodeSpec(extra)
        spec.toDOM = (node: ProsemirrorNode): DOMOutputSpec => {
            return ['table', ['colgroup'], ['tbody', extra.dom(node), 0]] as any;
        }
        return spec
    }

    ReactComponent: ComponentType<NodeViewComponentProps> = ({ node, forwardRef, selected }) => {
        if (node?.type?.name !== "table") {
            return null
        }

        const wrapperRef = useRef<HTMLDivElement | null>(null)
        const measurerRef = useRef<HTMLDivElement | null>(null)

        const [tableWidth, setTableWidth] = useState(0)
        const [tableHeight, setTableHeight] = useState(0)

        let tableWidthRef = useRef(0)
        let tableHeightRef = useRef(0)

        useEffect(() => {
            let measurerDOM = measurerRef.current
            if (!measurerDOM) return

            setTableWidth(measurerDOM.clientWidth)
            setTableHeight(measurerDOM.clientHeight)

            tableWidthRef.current = measurerDOM.clientWidth
            tableHeightRef.current = measurerDOM.clientHeight

            if (!measurerRef.current) return

            let table = measurerRef.current.children[0]?.children[0]
            if (!table || table.tagName?.toLowerCase() !== "table") return

            let colgroup = table.children[0]
            let tbody = table.children[1]
            if (!colgroup || colgroup.tagName?.toLowerCase() !== "colgroup") return
            if (!tbody || tbody.tagName?.toLowerCase() !== "tbody") return

            updateColumnsOnResize(node, colgroup, table, 10)

            console.debug('updateColumnsOnResize')
        }, [node])

        console.log({
            tableWidth,
            tableHeight
        })

        return <div className="remirror-table-controller-wrapper" ref={wrapperRef}>
            <TableColController tableWidth={tableWidthRef.current} />
            <TableRowController tableHeight={tableHeightRef.current} />
            <TableCornerController />

            <div className="remirror-table-measurer" ref={measurerRef}>
                <div className="remirror-table-wrapper" ref={forwardRef}></div>
            </div>
        </div>;
    };
    */
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
