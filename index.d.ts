import ejs from 'ejs';
import { OutputBundle } from 'rollup';
declare const _default: ({ src, dest, include, exclude, layout, extension, data, options }: {
    src: string;
    dest?: string | undefined;
    include?: string | string[] | undefined;
    exclude?: string | string[] | undefined;
    layout?: string | undefined;
    extension?: string | undefined;
    data: ejs.Data;
    options: ejs.Options;
}) => {
    name: string;
    generateBundle(_: unknown, bundle: OutputBundle): Promise<void>;
};
export default _default;
