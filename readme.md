# rollup-plugin-emit-ejs

This plugin allows you to emit files from ejs templates to rollup bundle.

It is primarily meant to emit html files since it helps you to link bundled javascripts/stylesheets and includes a basic layout system, but it can deal with any file type.

## Install

```bash
yarn add rollup-plugin-emit-ejs --dev
```

or

```bash
npm install rollup-plugin-emit-ejs -D
```

## Usage

```javascript
// rollup.config.js

import emitEJS from 'rollup-plugin-emit-ejs'

export default {
  // ...
  plugins: [
    emitEJS({
      src: 'src',
      layout: 'src/layout.html.ejs',
      data: {
        title: 'Hey',
        body: 'Hey Hey Hey'
      }
    })
  ]
}
```

```ejs
<!-- src/layout.html.ejs !-->

<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title><%= title %></title>
    <%- stylesheets %>
  </head>
  <body>
    <%- content %>
    <%- javascripts %>
  </body>
</html>
```

```ejs
<!-- src/index.html.ejs !-->

<main>
  <p><%= body %></p>
</main>
```

This will emit a file named `index.html` next to the javascript bundle file.

## Options

```typescript
{
  src: string
  include?: string | string[]
  exclude?: string | string[]
  extension?: string
  layout?: string
  javascript?: (file: string) => string
  stylesheet?: (file: string) => string
  data?: Data
  options?: Options
}
```

### src

Source directory to find ejs templates from.

Required

### include

Glob or array of globs defining which templates to include.

Default: `'**/*.ejs'`
  
### exclude

Glob or array of globs defining which templates to exclude.

Default: `[]`

> Note that the template provided in the `layout` option is automatically excluded.

### extension

Extension to append to emitted files (the leading `.` can be omitted).

Default: `undefined`

> Note that the trailing `.ejs` extension is automatically removed from filename.

### layout

Path to an ejs template to use as layout. Skip this option if you don't need layout.

Default: `undefined`

### javascript

Function called for printing script tags linking to javascript bundle files.

Default: <code>file => &grave;&lt;script src="${file}"&gt;&lt;/script&gt;&grave;</code>

### stylesheet

Function called for printing link tags linking to css bundle files.

Default: <code>file => &grave;&lt;link rel="stylesheet" href="${file}"&gt;&grave;</code>

### data

Data to pass to ejs.

Default: `{}`

> The following helper variables are forced by the plugin and available in all templates:
> - `javascripts`: script tags linking to javascript bundles
> - `stylesheets`: link tags linking to css bundles
>
> In the layout, an extra `content` variable is passed containing the content to wrap into the layout.
>
> These variables need to be printed **unescaped** if you whish to use it as html, use the corresponding ejs tag: `<%-` (See [ejs tags](https://github.com/mde/ejs#tags))

### options

Options to pass to ejs. (See [ejs options](https://github.com/mde/ejs#options))

Default: `{}`

> Note that the `filename` options is forced by the plugin.
