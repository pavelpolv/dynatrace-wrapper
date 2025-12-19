#!/usr/bin/env node

import * as esbuild from 'esbuild';
import { exec } from 'child_process';
import { promisify } from 'util';
import { rm } from 'fs/promises';

const execAsync = promisify(exec);

async function build() {
  console.log('🚀 Начинаем сборку пакета @repo/metrics...\n');

  try {
    // 1. Очистка директории dist
    console.log('🧹 Очистка директории dist...');
    await rm('dist', { recursive: true, force: true });
    console.log('✅ Директория dist очищена\n');

    // 2. Сборка ESM бундла через esbuild
    console.log('📦 Сборка ESM модуля через esbuild...');
    await esbuild.build({
      entryPoints: ['src/index.ts'],
      bundle: true,
      format: 'esm',
      outfile: 'dist/index.js',
      platform: 'browser',
      target: ['es2020'],
      sourcemap: true,
      external: ['react'], // React как peer dependency
      minify: false, // Для лучшей отладки, можно включить для продакшена
      splitting: false,
      treeShaking: true,
      metafile: true,
      logLevel: 'info',
    });
    console.log('✅ ESM модуль собран успешно\n');

    // 3. Генерация TypeScript типов
    console.log('📝 Генерация TypeScript типов...');
    await execAsync('tsc --emitDeclarationOnly --declaration --declarationMap');
    console.log('✅ TypeScript типы сгенерированы успешно\n');

    console.log('🎉 Сборка завершена успешно!');
    console.log('\n📂 Результат:');
    console.log('   - dist/index.js (ESM модуль)');
    console.log('   - dist/index.js.map (source map)');
    console.log('   - dist/**/*.d.ts (TypeScript типы)');
    console.log('   - dist/**/*.d.ts.map (source maps для типов)');
  } catch (error) {
    console.error('❌ Ошибка при сборке:', error);
    process.exit(1);
  }
}

build();
