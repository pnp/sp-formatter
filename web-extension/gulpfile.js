const gulp = require('gulp');
const fs = require('fs');
const archiver = require('archiver');

gulp.task('zip', (done) => {

    if (!fs.existsSync('dist')) {
        fs.mkdirSync('dist');
    }

    const output = fs.createWriteStream(__dirname + '/dist/app.zip');
    const archive = archiver('zip', {
        zlib: { level: 9 }
    });

    output.on('close', function () {
        console.log('Created dist/app.zip package');
        done();
    });

    archive.on('error', (err) => {
        throw err;
    });

    archive.pipe(output);

    archive.directory('app/', false);

    archive.finalize();
});
