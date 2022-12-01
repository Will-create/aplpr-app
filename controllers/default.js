exports.install = function() {
    ROUTE('GET /', home);
    ROUTE('POST /detect/', detect, ['upload'], 1024 * 10);
}

function home() {
    var self = this;

    self.view('index')
}


async function detect() {
    var self = this;

    var file = self.files[0];
    savefile(file, function(filename) {

        SHELL('alpr -c ' + ('eu') + ' -j ' + filename, function(err, response) {

            if (err) {
                self.json({ error: err + '' });
                PATH.unlink(filename);
                return;
            }

            var results = response.split('\n').trim();

            if (results.length > 0)
                //self.json({ success: true, value: results[1].split('\t')[0].split(' ')[1] });
                self.json({ success: true, value: JSON.parse(results) });
            else
                self.json({ success: true, value: 'Plate number not found' });

            PATH.unlink(filename);
        });
    });
}

var savefile = function (file, callback) {
    PATH.mkdir(PATH.public('alpr'));

    if (file) {
        F.Fs.readFile(file.path, function(err, bin) {
            console.log(file);
            var filename = PATH.public('alpr/' + U.getName(file.path).split('.')[0] + '.' + U.getExtension(file.filename));
            F.Fs.writeFile(filename, bin, function(err, res){
                callback(filename);
            });
        });
    }
};
