/// <reference types="ejs" />
import ejs from 'ejs';
import { Plugin } from 'rollup';
declare const _default: ({ src, dest, include, exclude, layout, extension, data, options }: {
    src: string;
    dest?: string | undefined;
    include?: string | string[] | undefined;
    exclude?: string | string[] | undefined;
    layout?: string | undefined;
    extension?: string | undefined;
    data?: ejs.Data | undefined;
    options?: ejs.Options | undefined;
}) => Plugin;
export { _default as default };
//# sourceMappingURL=index.d.ts.map