"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const fast_glob_1 = __importDefault(require("fast-glob"));
const ejs_1 = __importDefault(require("ejs"));
exports.default = ({ src, dest = '.', include = '**/*.ejs', exclude = [], layout = undefined, extension = undefined, data = {}, options = {} }) => {
    const ignore = Array.isArray(exclude) ? exclude : [exclude];
    const relativeTo = (target) => {
        target = path_1.default.dirname(target);
        return (file) => path_1.default.relative(target, file);
    };
    const getTemplates = () => fast_glob_1.default(include, { cwd: src, ignore });
    extension = extension ? '.' + extension.replace(/^\./, '') : '';
    layout && ignore.push(path_1.default.relative(src, layout));
    return {
        name: 'emit-ejs',
        async buildStart() {
            layout && this.addWatchFile(layout);
            (await getTemplates()).forEach(file => {
                this.addWatchFile(src + '/' + file);
            });
        },
        async generateBundle(_, bundle) {
            let render;
            const templates = await getTemplates();
            const javascripts = [];
            const stylesheets = [];
            const dataFor = (fileName) => ({
                ...data,
                javascripts: javascripts.map(relativeTo(fileName)),
                stylesheets: stylesheets.map(relativeTo(fileName))
            });
            if (layout) {
                const renderLayout = ejs_1.default.compile((await fs_extra_1.default.readFile(layout)).toString(), { ...options, filename: layout });
                render = async (template, fileName) => {
                    const templateData = dataFor(fileName);
                    return renderLayout({ ...templateData, content: ejs_1.default.render((await fs_extra_1.default.readFile(template)).toString(), templateData, { ...options, filename: template }) });
                };
            }
            else {
                render = async (template, fileName) => ejs_1.default.render((await fs_extra_1.default.readFile(template)).toString(), dataFor(fileName), { ...options, filename: template });
            }
            Object.values(bundle).forEach(file => {
                switch (path_1.default.extname(file.fileName)) {
                    case '.js':
                        file.isEntry && javascripts.push(file.fileName);
                        break;
                    case '.css':
                        file.type === 'asset' && stylesheets.push(file.fileName);
                        break;
                }
            });
            await Promise.all(templates.map(file => (async () => {
                const fileName = path_1.default.join(dest, file.replace(/\.ejs$/, '') + extension);
                this.emitFile({
                    type: 'asset',
                    fileName,
                    source: await render(src + '/' + file, fileName)
                });
            })()));
        }
    };
};
