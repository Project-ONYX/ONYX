var express = require('express');
var fs = require('fs');
var cors = require('cors');
var multer = require('multer');
var path = require('path');
var mongoose = require('mongoose');
var temp = require('temp');
var uuid = require('node-uuid');

var FileSchema = require('../src/model/FileSchema');

const PORT = 3001;

var router = express.Router();
mongoose.connect('127.0.0.1','onyx');
var app = express();

mongoose.connection.on('open', function() {
	console.log('mongoose is connected');

	const storage = multer.memoryStorage();

	const upload = multer({ storage });

	router.get('/', function(req, res) {
		res.json({ message: 'API Initialized!'});
	});

	router.get('/files/:id', (req, res, next) => {
		FileSchema.findOne({id: (req.params.id)}, function(err, file){
			if(err) {
				res.send(err);
			} else {
				res.setHeader('Content-Disposition', 'attachment; filename=task.zip');
				res.end(file.file.data)
			}
		});
	});

	router.post('/files', upload.single('file'), (req, res) => {
		const file = req.file; // actual file content
		const meta = req.body; // all meta datqa passed along

		var newFile = new FileSchema();
		newFile.id = uuid.v4();
		newFile.file.data = file.buffer;
		newFile.file.contentType = 'application/zip';
		newFile.save();
		res.json({Id: newFile.id});
	});

	app.use('/api', router);
	app.use(cors());

	const server = app.listen(PORT, () => {
		var { address, port } = server.address();
		if(address === "::") {
			address = "localhost";
		}
		console.log('Listening at http://' + address + ':' + port);
	});
});
