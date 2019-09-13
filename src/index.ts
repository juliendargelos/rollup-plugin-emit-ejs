import fs from 'fs-extra'
import path from 'path'
import glob from 'fast-glob'
import ejs, { Data, Options } from 'ejs'
import { OutputOptions, PluginContext } from 'rollup'

const javascripts = `<emit-ejs-javascripts></emit-ejs-javascripts>`
const stylesheets = `<emit-ejs-stylesheets></emit-ejs-stylesheets>`

const render = async (
  file: string,
  layout: string | undefined,
  data: Data,
  options: Options
): Promise<string> => layout
  ? render(layout, undefined, {
      ...data,
      javascripts,
      stylesheets,
      content: await render(file, undefined, data, options)
    }, options)
  : ejs.render(
      (await fs.readFile(file)).toString(),
      { ...data, javascripts, stylesheets },
      { ...options, filename: file }
    )

export default ({
  src,
  dest = undefined,
  include = '**/*.ejs',
  exclude = [],
  extension = undefined,
  layout = undefined,
  javascript = file => `<script src="${file}"></script>`,
  stylesheet = file => `<link rel="stylesheet" href="${file}">`,
  data = {},
  options = {}
}: {
  src: string
  dest?: string,
  include?: string | string[]
  exclude?: string | string[]
  extension?: string
  layout?: string
  javascript?: (file: string) => string
  stylesheet?: (file: string) => string
  data: Data,
  options: Options
}) => {
  let files: string[]
  const ignore = Array.isArray(exclude) ? exclude : [exclude]
  const links = [
    { identifier: stylesheets, print: stylesheet, glob: '*.css' },
    { identifier: javascripts, print: javascript, glob: '*.js' }
  ]

  extension = extension ? '.' + extension.replace(/^\./, '') : ''
  layout && ignore.push(path.relative(src, layout))

  return {
    name: 'emit-ejs',

    async generateBundle(outputOptions: OutputOptions) {
      const sourceFiles = await glob(include, { cwd: src, ignore })

      if (!dest) {
        if (outputOptions.file) dest = path.dirname(outputOptions.file)
        else if (outputOptions.dir) dest = outputOptions.dir
      }

      files = (await Promise.all(sourceFiles.map(file => (async () => {
        const fileName = file.replace(/\.ejs$/, '') + extension

        ;(this as unknown as PluginContext).emitFile({
          type: 'asset',
          fileName,
          source: await render(src + '/' + file, layout, data, options)
        })

        return dest ? path.resolve(dest, fileName) : ''
      })()))).filter(Boolean)
    },

    async writeBundle() {
      if (!dest) return

      const builtLinks = await Promise.all(links.map(link => (async () => ({
        ...link,
        files: await glob(link.glob, { cwd: dest, absolute: true })
      }))()))

      await Promise.all(files.map(file => (async () => {
        if (!(await fs.pathExists(file))) return

        await fs.writeFile(file, builtLinks.reduce((content, link) => (
          content.replace(link.identifier, link.files.map(linkFile => (
            link.print(path.relative(path.dirname(file), linkFile))
          )).join(''))
        ), (await fs.readFile(file)).toString()))
      })()))
    }
  }
}
