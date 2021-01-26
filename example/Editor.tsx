import "./style.css"
import "../node_modules/prosemirror-view/style/prosemirror.css"
import "../node_modules/prosemirror-tables/style/tables.css"

import React, { FC } from "react";
import { RemirrorProvider, useManager, useRemirror } from "@remirror/react";
import Menu from './Menu';
import { CorePreset } from "@remirror/preset-core"

import {
    TableExtension,
    TableRowExtension,
    TableHeaderExtension,
    TableCellExtension,
} from "../"
import { ReactComponentExtension } from "@remirror/extension-react-component";

const EXTENSIONS = () => [
    new CorePreset(),
    new ReactComponentExtension(),
    new TableExtension(),
    new TableRowExtension(),
    new TableHeaderExtension(),
    new TableCellExtension(),
];

/**
 * This component contains the editor and any toolbars/chrome it requires.
 */
const SmallEditor: FC = () => {
    const { getRootProps, commands } = useRemirror();

    return (
        <div  >
            <div   {...getRootProps()} />
            <Menu createTable={() => commands.createTable({})} />
        </div>
    );
};

const SmallEditorContainer: FC = () => {
    const extensionManager = useManager(EXTENSIONS);


    return (
        <RemirrorProvider
            manager={extensionManager}
        >
            <SmallEditor />
        </RemirrorProvider>
    );
};

export default SmallEditorContainer;
