import fs from 'fs-extra'
import path from 'path'
import glob from 'fast-glob'
import ejs, { Data, Options } from 'ejs'
import { Plugin, OutputBundle, OutputChunk, OutputAsset } from 'rollup'

export default ({
  src,
  dest = '.',
  include = '**/*.ejs',
  exclude = [],
  layout = undefined,
  extension = undefined,
  data = {},
  options = {}
}: {
  src: string
  dest?: string,
  include?: string | string[]
  exclude?: string | string[]
  layout?: string
  extension?: string
  data: Data,
  options: Options
}): Plugin => {
  const ignore = Array.isArray(exclude) ? exclude : [exclude]

  const relativeTo = (target: string) => {
    target = path.dirname(target)
    return (file: string): string => path.relative(target, file)
  }

  const getTemplates = () => glob(include, { cwd: src, ignore })

  extension = extension ? '.' + extension.replace(/^\./, '') : ''
  layout && ignore.push(path.relative(src, layout))

  return {
    name: 'emit-ejs',

    async buildStart() {
      layout && this.addWatchFile(layout)
      ;(await getTemplates()).forEach(file => {
       this.addWatchFile(src + '/' + file)
      })
    },

    async generateBundle(_: unknown, bundle: OutputBundle) {
      let render: (template: string, fileName: string) => Promise<string>
      const templates = await getTemplates()
      const javascripts: string[] = []
      const stylesheets: string[] = []

      const dataFor = (fileName: string) => ({
        ...data,
        javascripts: javascripts.map(relativeTo(fileName)),
        stylesheets: stylesheets.map(relativeTo(fileName))
      })

      if (layout) {
        const renderLayout = ejs.compile(
          (await fs.readFile(layout)).toString(),
          { ...options, filename: layout }
        )

        render = async (template: string, fileName: string) => {
          const templateData = dataFor(fileName)

          return renderLayout({ ...templateData, content: ejs.render(
            (await fs.readFile(template)).toString(),
            templateData,
            { ...options, filename: template }
          ) })
        }
      } else {
        render = async (template: string, fileName: string) => ejs.render(
          (await fs.readFile(template)).toString(),
          dataFor(fileName),
          { ...options, filename: template }
        )
      }

      Object.values(bundle).forEach(file => {
        switch (path.extname(file.fileName)) {
          case '.js':
            (file as OutputChunk).isEntry && javascripts.push(file.fileName)
            break
          case '.css':
            (
              file.type === 'asset' ||
              (file as unknown as OutputAsset).isAsset
            ) && stylesheets.push(file.fileName)
           break
        }
      })

      await Promise.all(templates.map(file => (async () => {
        const fileName = path.join(dest, file.replace(/\.ejs$/, '') + extension)

        this.emitFile({
          type: 'asset',
          fileName,
          source: await render(src + '/' + file, fileName)
        })
      })()))
    }
  }
}
