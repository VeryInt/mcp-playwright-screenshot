// const esbuild = require('esbuild');
import esbuild from 'esbuild';

esbuild.build({
    entryPoints: ['src/index.ts'],
    outfile: 'build/index.js',
    bundle: true,          // 打包所有依赖
    platform: 'node',      // 针对 Node.js
    target: 'node16',      // Node.js 版本
    //   format: 'cjs',         // CommonJS 格式
    format: 'esm',
    sourcemap: true,       // 可选，调试用
}).then(() => {
    console.log('Build complete!');
}).catch((error) => {
    console.error(error);
    process.exit(1);
});