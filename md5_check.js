const md5File = require('md5-file')
const path = require('path')
const colors = require('colors');
const {execSync} = require('child_process');
const fs = require('fs');
const extract = require('extract-zip');

const files = [
    path.join('public', 'index_html.js'),
    path.join('public', 'style.css'),
    path.join('public', 'index.html'),
    'index.js',
	'md5_check.js'
];

const check_files = (dir) => {
	console.log(`[checking current directory] ${dir}`);
		files.forEach( file => {
		const hash = md5File.sync( path.join(dir, file) );
		console.log(file.green, '=', hash);
	})
}

console.log('[downloading origin files]');

if (fs.existsSync(path.join(__dirname, 'loterey.zip'))){
	console.log('[clean origin files]');
    fs.rmSync(path.join(__dirname, 'loterey.zip'), { recursive: true });
}

execSync('wget -O loterey.zip https://github.com/ChervyachokMigo/loterey/archive/refs/heads/main.zip');

(async () => {
	try {
		const extract_path = path.join(__dirname, 'lotery_temp');

		if (fs.existsSync(extract_path)){
			console.log('[clean temp]');
			fs.rmSync(extract_path, { recursive: true });
		}
		console.log('[creating temp folder]');
		fs.mkdirSync(extract_path, {recursive: true});

		console.log('[extracting origin files]');
		await extract(path.join(__dirname, 'loterey.zip'), { dir: path.join(__dirname, 'lotery_temp') })
		

		check_files( __dirname );
		check_files( path.join(extract_path, 'loterey-main') );
	} catch (err) {
		// handle any errors
	}
})();