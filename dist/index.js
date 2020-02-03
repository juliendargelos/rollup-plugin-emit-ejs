'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fs = _interopDefault(require('fs-extra'));
var path = _interopDefault(require('path'));
var glob = _interopDefault(require('fast-glob'));
var ejs = _interopDefault(require('ejs'));

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

var index = ({ src, dest = '.', include = '**/*.ejs', exclude = [], layout = undefined, extension = undefined, data = {}, options = {} }) => {
    const ignore = Array.isArray(exclude) ? exclude : [exclude];
    const relativeTo = (target) => {
        target = path.dirname(target);
        return (file) => path.relative(target, file);
    };
    const getTemplates = () => glob(include, {
        cwd: src,
        ignore
    });
    extension = extension ? '.' + extension.replace(/^\./, '') : '';
    layout && ignore.push(path.relative(src, layout));
    return {
        name: 'emit-ejs',
        buildStart() {
            return __awaiter(this, void 0, void 0, function* () {
                layout && this.addWatchFile(layout);
                (yield getTemplates()).forEach(file => {
                    this.addWatchFile(src + '/' + file);
                });
            });
        },
        generateBundle(_, bundle) {
            return __awaiter(this, void 0, void 0, function* () {
                let render;
                const templates = yield getTemplates();
                const javascripts = [];
                const stylesheets = [];
                const dataFor = (fileName) => (Object.assign(Object.assign({}, data), { javascripts: javascripts.map(relativeTo(fileName)), stylesheets: stylesheets.map(relativeTo(fileName)) }));
                if (layout) {
                    const renderLayout = ejs.compile((yield fs.readFile(layout)).toString(), Object.assign(Object.assign({}, options), { filename: layout }));
                    render = (template, fileName) => __awaiter(this, void 0, void 0, function* () {
                        const templateData = dataFor(fileName);
                        return renderLayout(Object.assign(Object.assign({}, templateData), { content: ejs.render((yield fs.readFile(template)).toString(), templateData, Object.assign(Object.assign({}, options), { filename: template })) }));
                    });
                }
                else {
                    render = (template, fileName) => __awaiter(this, void 0, void 0, function* () {
                        return ejs.render((yield fs.readFile(template)).toString(), dataFor(fileName), Object.assign(Object.assign({}, options), { filename: template }));
                    });
                }
                Object.values(bundle).forEach(file => {
                    switch (path.extname(file.fileName)) {
                        case '.js':
                            file.isEntry && javascripts.push(file.fileName);
                            break;
                        case '.css':
                            (file.type === 'asset' ||
                                file.isAsset) && stylesheets.push(file.fileName);
                            break;
                    }
                });
                yield Promise.all(templates.map(file => (() => __awaiter(this, void 0, void 0, function* () {
                    const fileName = path.join(dest, file.replace(/\.ejs$/, '') + extension);
                    this.emitFile({
                        type: 'asset',
                        fileName,
                        source: yield render(src + '/' + file, fileName)
                    });
                }))()));
            });
        }
    };
};

module.exports = index;
//# sourceMappingURL=index.js.map
