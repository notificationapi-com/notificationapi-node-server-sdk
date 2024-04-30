import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path';
import { cwd } from 'process';

async function main() {
    const LIB_PATH = join(cwd(), 'lib');
    const CJS_PATH = join(LIB_PATH, 'cjs');
    const ESM_PATH = join(LIB_PATH, 'esm');

    await mkdir(CJS_PATH, { recursive: true })    
    await writeFile(join(CJS_PATH, 'package.json'), JSON.stringify({
        type: 'commonjs'
    }))
    
    await mkdir(ESM_PATH, { recursive: true })
    await writeFile(join(ESM_PATH, 'package.json'), JSON.stringify({
        type: 'module'
    }))
}

main().then(() => console.log('Done building'))