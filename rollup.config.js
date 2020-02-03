import autoExternal from 'rollup-plugin-auto-external'
import cleaner from 'rollup-plugin-cleaner'
import alias from '@rollup/plugin-alias'
import ts from 'rollup-plugin-ts'
import { eslint } from 'rollup-plugin-eslint'

import pkg from './package.json'
import tsconfig from './tsconfig.json'

export default {
  input: 'src/index.ts',
  output: {
    sourcemap: true,
    file: pkg.main,
    format: 'cjs'
  },
  plugins: [
    alias({
      resolve: ['.ts'],
      entries: Object
        .entries(tsconfig.compilerOptions.paths)
        .map(([find, [replacement]]) => ({ find, replacement }))
    }),
    eslint(),
    ts(),
    cleaner({ targets: [pkg.main.replace(/\/[^\/]+$/, '')] }),
    autoExternal()
  ]
}
