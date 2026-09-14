#!/usr/bin/env node

import * as esbuild from 'esbuild';

const PORT = 9000;

const ctx = await esbuild.context({
  entryPoints: ['src/index.ts'],
  bundle: true,
  format: 'esm',
  outfile: 'dist/index.js',
  platform: 'browser',
  target: ['es2020'],
  sourcemap: true,
  external: ['react'],
  minify: false,
  treeShaking: true,
  logLevel: 'info',
});

await ctx.watch();

const { port } = await ctx.serve({
  port: PORT,
  servedir: 'dist',
  onRequest: ({ remoteAddress, method, path, status, timeInMS }) => {
    console.log(`${method} ${path} [${status}] — ${timeInMS}ms`);
  },
});

console.log(`\n📦 @farzoom/metrics-front-lib dev server запущен`);
console.log(`   http://localhost:${port}/index.js`);
console.log(`   http://localhost:${port}/index.js.map`);
console.log(`\n👀 Слежу за изменениями в src/...\n`);