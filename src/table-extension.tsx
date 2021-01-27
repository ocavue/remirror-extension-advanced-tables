import { ApplySchemaAttributes, DOMOutputSpec, EditorView, NodeExtensionSpec, NodeView, NodeViewMethod } from '@remirror/core';
import { NodeViewComponentProps } from '@remirror/extension-react-component';
import { Node as ProsemirrorNode } from '@remirror/pm/model';
import {
    TableCellExtension as RemirrorTableCellExtension,
    TableExtension as RemirrorTableExtension,
    TableHeaderCellExtension as RemirrorTableHeaderCellExtension,
    TableRowExtension as RemirrorTableRowExtension
} from "@remirror/preset-table";
import { updateColumnsOnResize } from 'prosemirror-tables';
import React, { ComponentType, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { h } from './utils/jsx';

const TableRowController: React.FC<{ tableHeight: number }> = ({ tableHeight }) => {
    return <div className="remirror-table-row-controller" style={{ height: `${tableHeight}px` }}>
        1
    </div>
}

const TableColController: React.FC<{ tableWidth: number }> = ({ tableWidth }) => {
    return <div className="remirror-table-col-controller" style={{ width: `${tableWidth}px` }}>
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
    node: ProsemirrorNode
    cellMinWidth: number
    dom: HTMLElement
    tableMeasurer: HTMLElement
    table: HTMLElement
    colgroup: HTMLElement
    contentDOM: HTMLElement

    constructor(node: ProsemirrorNode, cellMinWidth: number) {
        this.node = node
        this.cellMinWidth = cellMinWidth

        this.contentDOM = h('tbody', { 'class': "re-rrrrrr-tbody" })
        this.colgroup = h('colgroup', { 'class': "re-rrrrrr-colgroup" })
        this.table = h('table', { 'class': 're-b' }, this.colgroup, this.contentDOM)
        this.tableMeasurer = h('div', { 'class': 'remirror-table-measurer' }, this.table)
        this.dom = h(
            'div', { 'class': 'remirror-table-controller-wrapper' },
            h('div', { 'class': "remirror-table-row-controller", 'style': 'height: 100px' }),
            h('div', { 'class': "remirror-table-col-controller", 'style': 'width: 100px' }),
            h('div', { 'class': "remirror-table-corner-controller" }),
            this.tableMeasurer,
        )

        updateColumnsOnResize(this.node, this.colgroup, this.table, this.cellMinWidth)
    }

    update(node: ProsemirrorNode) {
        if (node.type != this.node.type) return false
        this.node = node
        updateColumnsOnResize(node, this.colgroup, this.table, this.cellMinWidth)
        return true
    }

    ignoreMutation(record: ProsemirrorMutationRecord) {
        return record.type == "attributes" && (record.target == this.table || this.colgroup.contains(record.target))
    }
}

export class TableExtension extends RemirrorTableExtension {
    get name() {
        return "table" as const
    }

    createNodeViews = (): NodeViewMethod => {
        return (node: ProsemirrorNode, view: EditorView, getPos: boolean | (() => number)) => {
            return new TableView(node, 10)
        }
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
