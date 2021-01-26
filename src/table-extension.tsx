import React, { useRef, useLayoutEffect, useState } from 'react';
import { NodeViewComponentProps, ReactComponentExtension } from "@remirror/extension-react-component"
import {
    TableCellExtension as RemirrorTableCellExtension,
    TableExtension as RemirrorTableExtension,
    TableHeaderCellExtension as RemirrorTableHeaderCellExtension,
    TableRowExtension as RemirrorTableRowExtension
} from "@remirror/preset-table"
import { ComponentType } from "react";
import { Node as ProsemirrorNode } from '@remirror/pm/model';

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


export class TableExtension extends RemirrorTableExtension {
    get name() {
        return "table" as const
    }

    ReactComponent: ComponentType<NodeViewComponentProps> = ({ node, forwardRef, selected }) => {
        console.log("node:", node)
        // console.log("forwardRef:", forwardRef)
        console.log("selected:", selected)

        if (node?.type?.name !== "table") {
            return null
        }

        const wrapperRef = useRef<HTMLDivElement | null>(null)
        const measurerRef = useRef<HTMLDivElement | null>(null)

        const [tableWidth, setTableWidth] = useState(0)
        const [tableHeight, setTableHeight] = useState(0)

        let tableWidthRef = useRef(0)
        let tableHeightRef = useRef(0)

        useLayoutEffect(() => {
            let measurerDOM = measurerRef.current
            if (!measurerDOM) return

            setTableWidth(measurerDOM.clientWidth)
            setTableHeight(measurerDOM.clientHeight)

            tableWidthRef.current = measurerDOM.clientWidth
            tableHeightRef.current = measurerDOM.clientHeight

            console.log("measurerDOM:",measurerDOM.clientWidth, measurerDOM.offsetWidth, measurerDOM.scrollWidth)

        }, [])

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
