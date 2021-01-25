import "./style.css"
import "../node_modules/prosemirror-view/style/prosemirror.css"

import React, { FC } from "react";
import { RemirrorProvider, useManager, useRemirror } from "@remirror/react";

const EXTENSIONS = () => [];

/**
 * This component contains the editor and any toolbars/chrome it requires.
 */
const SmallEditor: FC = () => {
    const { getRootProps } = useRemirror();

    return (
        <div  >
            <div   {...getRootProps()} />
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
