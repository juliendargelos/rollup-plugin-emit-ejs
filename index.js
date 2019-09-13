"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const fast_glob_1 = __importDefault(require("fast-glob"));
const ejs_1 = __importDefault(require("ejs"));
const javascripts = `<emit-ejs-javascripts></emit-ejs-javascripts>`;
const stylesheets = `<emit-ejs-stylesheets></emit-ejs-stylesheets>`;
const render = async (file, layout, data, options) => layout
    ? render(layout, undefined, {
        ...data,
        javascripts,
        stylesheets,
        content: await render(file, undefined, data, options)
    }, options)
    : ejs_1.default.render((await fs_extra_1.default.readFile(file)).toString(), { ...data, javascripts, stylesheets }, { ...options, filename: file });
const destUnavailable = () => new Error('Cannot retreive destination directory: specify a destination' +
    'by providing a path either in the dest plugin option, ' +
    'or in the output.file or output.dir rollup option');
exports.default = ({ src, dest = undefined, include = '**/*.ejs', exclude = [], extension = undefined, layout = undefined, javascript = file => `<script src="${file}"></script>`, stylesheet = file => `<link rel="stylesheet" href="${file}">`, data = {}, options = {} }) => {
    let files;
    const ignore = Array.isArray(exclude) ? exclude : [exclude];
    const links = [
        { identifier: stylesheets, print: stylesheet, glob: '*.css' },
        { identifier: javascripts, print: javascript, glob: '*.js' }
    ];
    extension = extension ? '.' + extension.replace(/^\./, '') : '';
    layout && ignore.push(path_1.default.relative(src, layout));
    return {
        name: 'emit-ejs',
        async generateBundle(outputOptions) {
            const sourceFiles = await fast_glob_1.default(include, { cwd: src, ignore });
            if (!dest) {
                if (outputOptions.file)
                    dest = path_1.default.dirname(outputOptions.file);
                else if (outputOptions.dir)
                    dest = outputOptions.dir;
                else
                    throw destUnavailable();
            }
            files = await Promise.all(sourceFiles.map(file => (async () => {
                const fileName = file.replace(/\.ejs$/, '') + extension;
                this.emitFile({
                    type: 'asset',
                    fileName,
                    source: await render(src + '/' + file, layout, data, options)
                });
                return path_1.default.resolve(dest, fileName);
            })()));
        },
        async writeBundle() {
            if (!dest)
                throw destUnavailable();
            const builtLinks = await Promise.all(links.map(link => (async () => ({
                ...link,
                files: await fast_glob_1.default(link.glob, { cwd: dest, absolute: true })
            }))()));
            await Promise.all(files.map(file => (async () => {
                if (!(await fs_extra_1.default.pathExists(file)))
                    return;
                await fs_extra_1.default.writeFile(file, builtLinks.reduce((content, link) => (content.replace(link.identifier, link.files.map(linkFile => (link.print(path_1.default.relative(path_1.default.dirname(file), linkFile)))).join(''))), (await fs_extra_1.default.readFile(file)).toString()));
            })()));
        }
    };
};
