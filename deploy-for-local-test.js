import fs from 'fs/promises'
import path, {sep} from 'path'
import packageJson from './package.json' // `node --experimental-json-modules`
													  // // https://nodejs.org/api/esm.html#esm_no_json_module_loading

/**
 * Created on 1399/9/27 (2020/12/17).
 * Thank https://stackoverflow.com/a/64255382/5318303
 * @author {@link https://mirismaili.github.io S. Mahdi Mir-Ismaili}
 */

async function copyDir(src, dest) {
	const entries = await fs.readdir(src, {withFileTypes: true})

	console.group(`${src}${sep}  ==>  ${dest}${sep}`)
	{
		for (const entry of entries) {
			const srcPath = path.join(src, entry.name)
			const destPath = path.join(dest, entry.name)

			entry.isDirectory() ?
				await copyDir(srcPath, destPath) :
				await fs.copyFile(srcPath, destPath).then(() => console.log(`${srcPath}  -->  ${destPath}`))
		}
	}
	console.groupEnd()
}

for (const projectPath of process.env.CONSUMER_PROJECT_PATH.split(',')) {
	const dest = path.join(projectPath, 'node_modules', packageJson.name, 'dist')

	if (!(await fs.stat(dest)).isDirectory()) {
		console.error('The path is not a directory:', dest)
		continue
	}

	await copyDir('dist', dest).catch(console.error.bind(console))
}
