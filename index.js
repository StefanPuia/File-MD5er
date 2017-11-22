const md5File = require('md5-file');
const readDirFiles = require('read-dir-files');
const fs = require('fs');

//default path is current path
let path = './files';
if (process.argv.length > 2) {
    path = process.argv[2];
}

// create a new directory if not exists
var donedir = path + '/md5-files';

if (!fs.existsSync(donedir)){
    fs.mkdirSync(donedir);
}
 

readDirFiles.list(path, function (err, filenames) {
	if (err) return console.dir(err);
	for(let i = 0; i<filenames.length; i++) {
		let filename = filenames[i];
		if(filename.substr(-1) != '/') {
			let parts = filename.split(/\\+/);
			let file = parts[parts.length-1];
			if(file != "index.js") {
				let ext = file.split('.')[1];

				md5File(filename, (err, hash) => {
				  	if (err) 
				  		throw err

				  	let newfile = donedir + '/' + hash + '.' + ext;
					move(filename, newfile, callback);
				});
			}			
		}
	}
});

function move(oldPath, newPath, callback) {

    fs.rename(oldPath, newPath, function (err) {
        if (err) {
            if (err.code === 'EXDEV') {
                copy();
            } else {
                callback(err);
            }
            return;
        }
    });

    function copy() {
        var readStream = fs.createReadStream(oldPath);
        var writeStream = fs.createWriteStream(newPath);

        readStream.on('error', callback);
        writeStream.on('error', callback);

        readStream.on('close', function () {
            fs.unlink(oldPath, callback);
        });

        readStream.pipe(writeStream);
    }
}

function callback(err) {
	if(err.code == 'EPERM') {
		console.log("File: " + err.path);
		console.log("Dest: " + err.dest);
		console.log('File already exists or no write permissions.\n');
	}
}