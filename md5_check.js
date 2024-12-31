const md5File = require('md5-file')
const path = require('path')
const colors = require('colors');

const files = [
    path.join('public', 'index_html.js'),
    path.join('public', 'style.css'),
    path.join('public', 'index.html'),
    'index.js',
	'md5_check.js'
];

console.log(__dirname);

files.forEach( file => {
	const hash = md5File.sync( path.join(__dirname, file) );
	console.log(file.green, '=', hash);
})