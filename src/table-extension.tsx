import React, { RefCallback } from 'react';
import { NodeViewComponentProps, ReactComponentExtension } from "@remirror/extension-react-component"
import {
    TableCellExtension as RemirrorTableCellExtension,
    TableExtension as RemirrorTableExtension,
    TableHeaderCellExtension as RemirrorTableHeaderCellExtension,
    TableRowExtension as RemirrorTableRowExtension
} from "@remirror/preset-table"
import { ComponentType } from "react";
import { Node as ProsemirrorNode } from '@remirror/pm/model';

const TableController: React.FC<{ tableNode: ProsemirrorNode }> = ({ }) => {
    return <div className="remirror-table-controller" >
        controller
        <button onClick={() => {}}>test</button>
    </div>;
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

        return <div className="remirror-table-controller-wrapper">
            <TableController tableNode={node} />
            <div className="remirror-table-wrapper" ref={forwardRef}></div>
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
