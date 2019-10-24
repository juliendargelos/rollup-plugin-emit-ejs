import { rollup } from 'rollup'
import fs from 'fs-extra'
import os from 'os'
import emitFiles from 'rollup-plugin-emit-files'
import emitEJS from '../src'

const fixtures: string = `${__dirname}/fixtures`
let output: string

beforeEach(async () => {
  output = `${os.tmpdir()}/rollup-plugin-emit-ejs`
  await fs.emptyDir(output)
})

afterAll(async () => {
  await fs.emptyDir(output)
})

it('should emit index templates to the output dir, with foo, javascripts and stylesheets variables', async () => {
  const bundle = await rollup({
    input: `${fixtures}/index.js`,
    plugins: [
      emitFiles({
        src: fixtures,
        include: 'index.css'
      }),
      emitEJS({
        layout: `${fixtures}/layout.html.ejs`,
        exclude: 'page.ejs',
        src: fixtures,
        data: {
          foo: 'bar'
        }
      })
    ]
  })

  await bundle.write({
    file: `${output}/index.js`,
    format: 'iife',
    name: 'test'
  })

  expect(await fs.pathExists(`${output}/index.js`)).toEqual(true)
  expect(await fs.pathExists(`${output}/layout.html`)).toEqual(false)
  expect(await fs.pathExists(`${output}/index.html`)).toEqual(true)
  expect(await fs.pathExists(`${output}/page`)).toEqual(false)
  expect((await fs.readFile(`${output}/index.html`)).toString().trim()).toEqual('layout\nindex.js\nindex.css\nbar')
})

it('should emit page template adding .html extension, without layout', async () => {
  const bundle = await rollup({
    input: `${fixtures}/index.js`,
    plugins: [emitEJS({
      include: 'page.ejs',
      extension: 'html',
      src: fixtures,
      data: {},
      options: {}
    })]
  })

  await bundle.write({
    file: `${output}/index.js`,
    format: 'iife',
    name: 'test'
  })

  expect(await fs.pathExists(`${output}/page.html`)).toEqual(true)
  expect((await fs.readFile(`${output}/page.html`)).toString().trim()).toEqual('page')
})
