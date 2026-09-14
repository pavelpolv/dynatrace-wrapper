#!/usr/bin/env node

import * as esbuild from 'esbuild';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const PORT = 9000;
const DIST = path.resolve('dist');

const MIME_TYPES = {
  '.js': 'text/javascript; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.ts': 'text/plain; charset=utf-8',
};

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

http.createServer((req, res) => {
  const filePath = path.join(DIST, req.url === '/' ? '/index.js' : req.url);
  const ext = path.extname(filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }

    res.writeHead(200, {
      'Content-Type': MIME_TYPES[ext] ?? 'application/octet-stream',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    });
    res.end(data);
    console.log(`GET ${req.url} [200]`);
  });
}).listen(PORT, () => {
  console.log(`\n📦 @farzoom/metrics-front-lib dev server запущен`);
  console.log(`   http://localhost:${PORT}/index.js`);
  console.log(`   http://localhost:${PORT}/index.js.map`);
  console.log(`\n👀 Слежу за изменениями в src/...\n`);
});