import ejs from 'ejs';
import { Plugin } from 'rollup';
declare const _default: ({ src, dest, include, exclude, layout, extension, data, options }: {
    src: string;
    dest?: string | undefined;
    include?: string | string[] | undefined;
    exclude?: string | string[] | undefined;
    layout?: string | undefined;
    extension?: string | undefined;
    data: ejs.Data;
    options: ejs.Options;
}) => Plugin;
export default _default;
