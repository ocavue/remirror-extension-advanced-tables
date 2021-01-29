# remirror-experimental-extension-tables

## Roadmap

1. Based on remirror `next`, develop the features and release the first version.
2. After remirror `beta` is released, migrate the underlying implementation to remirror `beta`.
3. Merge the code into the remirror repository and release it as an official remirror package.
4. Archive this repository

## Usage

```
$ npm install remirror-experimental-extension-tables
# or
$ yarn add remirror-experimental-extension-tables
```

Then, in your codebase:

```ts
import "node_modules/remirror-experimental-extension-tables/style/table.css" // you can also use `style/table.scss` if your bundler support it.

import { TableExtension, TableRowExtension, TableHeaderExtension, TableCellExtension } from 'remirror-experimental-extension-tables'
```

## Development

```bash
$ yarn install

# run the example in the browser
$ yarn dev
```
