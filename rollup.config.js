import { createRequire } from 'node:module';
import replace from '@rollup/plugin-replace';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');

const globals = {
  vue: 'Vue',
  signature_pad: 'SignaturePad',
  'trim-canvas': 'trimCanvas',
};
const isProduction = process.env.NODE_ENV === 'production';

const config = {
  input: 'src/index.ts',
  external: ['vue', 'signature_pad', 'trim-canvas'],
  plugins: [
    nodeResolve({ browser: true, extensions: ['.mjs', '.js', '.json', '.ts'] }),
    typescript({ tsconfig: './tsconfig.json' }),
    commonjs({
      include: 'node_modules/**',
    }),
  ],
  output: [
    { file: pkg.main, format: 'cjs', exports: 'default', globals },
    {
      file: pkg.module,
      format: 'es',
      globals,
    },
    {
      file: pkg.unpkg,
      format: 'umd',
      name: 'VueSignatureCanvas',
      globals,
    },
  ],
};

if (isProduction) {
  config.plugins.push(
    replace({
      preventAssignment: true,
      values: {
        'process.env.NODE_ENV': JSON.stringify('production'),
      },
    }),
  );
  config.plugins.push(terser());
}

export default config;
