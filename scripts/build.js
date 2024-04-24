import { writeFile } from 'fs/promises'

await writeFile('./lib/cjs/package.json', JSON.stringify({
    type: 'commonjs'
}))

await writeFile('./lib/esm/package.json', JSON.stringify({
    type: 'module'
}))