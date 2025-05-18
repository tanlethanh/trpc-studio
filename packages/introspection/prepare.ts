// copy README, 
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const readmePath = join(__dirname, 'README.md');
const distPath = join(__dirname, 'dist', 'README.md');

const readme = await readFile(readmePath, 'utf-8');
await writeFile(distPath, readme);

// Copy package.json with change entries to ./index.js and ./index.d.ts
const packageJsonPath = join(__dirname, 'package.json');
const packageJson = await readFile(packageJsonPath, 'utf-8');
const packageJsonContent = JSON.parse(packageJson);
packageJsonContent.main = './index.js';
packageJsonContent.module = './index.mjs';
packageJsonContent.types = './index.d.ts';
await writeFile(join(__dirname, 'dist', 'package.json'), JSON.stringify(packageJsonContent, null, 2));


