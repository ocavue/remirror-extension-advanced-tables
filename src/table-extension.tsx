import { ApplySchemaAttributes, CreatePluginReturn } from '@remirror/core';
import type { ClickHandler, ClickHandlerState, CreateEventHandlers } from '@remirror/extension-events';
import {
  TableCellExtension as RemirrorTableCellExtension,
  TableExtension as RemirrorTableExtension,
  TableHeaderCellExtension as RemirrorTableHeaderCellExtension,
  TableRowExtension as RemirrorTableRowExtension,
} from '@remirror/preset-table';
import { REMIRROR_TABLE_CONTROLLER_CLICK_CALLBACK } from './const';
import { newTableContollerPlugin, TableContollerPluginState } from './table-plugin';

export class TableExtension extends RemirrorTableExtension {
  get name() {
    return 'table' as const;
  }

  // createNodeViews = (): NodeViewMethod => {
  //     return (node: ProsemirrorNode, view: EditorView, getPos: boolean | (() => number), decorations: Decoration[]) => {
  //         const getPluginState = (): TableContollerPluginState => this.getPluginState(view.state)
  //         return new TableView(node, 10, getPluginState, decorations)
  //     }
  // }

  createPlugin(): CreatePluginReturn<TableContollerPluginState> {
    return newTableContollerPlugin();
  }

  createNodeSpec(extra: ApplySchemaAttributes) {
    const spec = super.createNodeSpec(extra);
    console.debug(`[TableView.createNodeSpec]`, spec);
    return spec;
  }

  createEventHandlers(): CreateEventHandlers {
    const click: ClickHandler = (event: MouseEvent, clickState: ClickHandlerState) => {
      const nodeWithPosition = clickState.getNode('table');
      console.debug(`[TableView.click] nodeWithPosition:`, nodeWithPosition);
      if (nodeWithPosition) {
        const { node: tableNode, pos } = nodeWithPosition;
        console.debug(`[TableView.click] tableNode:`, tableNode);
        if (event.target) {
          const fn = (event.target as any)[REMIRROR_TABLE_CONTROLLER_CLICK_CALLBACK];
          if (fn && typeof fn === 'function') {
            console.debug(`[TableView.click] fn`);
            fn(pos);
          }
        }
      }
    };
    return { click };
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
    return 'tableRow' as const;
  }
}

export class TableHeaderExtension extends RemirrorTableHeaderCellExtension {
  get name() {
    return 'tableHeaderCell' as const;
  }
}

export class TableCellExtension extends RemirrorTableCellExtension {
  get name() {
    return 'tableCell' as const;
  }
}
