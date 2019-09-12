import ejs from 'ejs';
import { OutputOptions } from 'rollup';
declare const _default: ({ src, include, exclude, extension, layout, javascript, stylesheet, data, options }: {
    src: string;
    include?: string | string[] | undefined;
    exclude?: string | string[] | undefined;
    extension?: string | undefined;
    layout?: string | undefined;
    javascript?: ((file: string) => string) | undefined;
    stylesheet?: ((file: string) => string) | undefined;
    data: ejs.Data;
    options: ejs.Options;
}) => {
    name: string;
    generateBundle(outputOptions: OutputOptions): Promise<void>;
    writeBundle(): Promise<void>;
};
export default _default;
