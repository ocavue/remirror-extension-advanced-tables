# remirror-experimental-extension-tables

 

## Roadmap

1. Based on remirror `next`, develop the features and release version `v1`.
2. After remirror `beta` is released, migrate the underlying implementation to remirror `beta` and release version `v2`.
3. Merge the code into the remirror repository and release it as an official remirror package.
4. Archive this repository.

The goal is to keep the identical API between each step and make the migration as smooth as possible.

## Usage

```
$ npm install remirror-experimental-extension-tables
# or
$ yarn add remirror-experimental-extension-tables
```

Then, in your codebase:

```ts
import "node_modules/remirror-experimental-extension-tables/style/table.css" // you can also use `style/table.scss` if your bundler support it.

import { TableExtension, TableRowExtension, TableHeaderCellExtension, TableCellExtension } from 'remirror-experimental-extension-tables'
```

## Development

```bash
$ yarn install

# run the example in the browser
$ yarn dev
```

## Features

Please check https://github.com/ocavue/remirror-experimental-extension-tables/issues/3 for some demo.



