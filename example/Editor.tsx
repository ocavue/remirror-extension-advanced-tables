import '../style/table.scss';
import '../node_modules/prosemirror-view/style/prosemirror.css';
// import '../node_modules/prosemirror-tables/style/tables.css';

import React, { FC } from 'react';
import { RemirrorProvider, useManager, useRemirror } from '@remirror/react';
import Menu from './Menu';
import { CorePreset } from '@remirror/preset-core';
import { ProsemirrorDevTools } from '@remirror/dev';
import { ReactComponentExtension } from '@remirror/extension-react-component';
import {
  TableExtension,
  TableRowExtension,
  TableHeaderCellExtension,
  TableCellExtension,
  TableControllerCellExtension,
  TableCellMenu,
} from '../src';

const EXTENSIONS = () => [
  new CorePreset(),
  new ReactComponentExtension(),
  new TableExtension(),
  new TableRowExtension(),
  new TableHeaderCellExtension(),
  new TableCellExtension(),
  new TableControllerCellExtension(),
];

/**
 * This component contains the editor and any toolbars/chrome it requires.
 */
const SmallEditor: FC = () => {
  const { getRootProps, commands } = useRemirror();

  return (
    <div>
      <Menu createTable={commands.createTable} />
      <div {...getRootProps()} />
    </div>
  );
};

const SmallEditorContainer: FC = () => {
  const extensionManager = useManager(EXTENSIONS);

  return (
    <RemirrorProvider manager={extensionManager}>
      <SmallEditor />
      <ProsemirrorDevTools />
      <TableCellMenu />
    </RemirrorProvider>
  );
};

export default SmallEditorContainer;
