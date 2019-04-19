const express = require('express')
const bodyParser= require('body-parser')
const app = express()
const multer = require('multer');
const mkdirp = require('mkdirp');
const path = require('path');
fs = require('fs-extra')
app.use(bodyParser.urlencoded({extended: true}))

let uploadPath='uploads';
mkdirp.sync(uploadPath)
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
    cb(null, new Date(Date.now()).toISOString().substr(0, 10)+'_'+file.originalname);
  }

})

var upload = multer({ storage: storage 
  ,
  fileFilter: function (req,file, cb) {

    // support .csv and .txt
    var filetypes = /csv|plain|txt|excel/;
    var mimetype = filetypes.test(file.mimetype);
    var extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      cb(null, true);
    }
    cb(null, false);
  }
})

app.listen(9000, () => {
  console.log('listening on 9000')
})

app.use('/static', express.static(__dirname + '/public'));

app.get('/',function(req,res){
  res.sendFile('http://localhost:9000/static/index.html');

});

// upload single file
app.post('/uploadfile', upload.single('myFile'), (req, res, next) => {
  const file = req.file
  if (!file) {
    const error = new Error('Please a valid file, accepted file types : .txt | .csv')
    error.httpStatusCode = 400
    return next(error)

  }
    res.send(file)
 
})

//Uploading multiple files
app.post('/uploadmultiple', upload.array('myFiles', 20), (req, res, next) => {
  const files = req.files
  if (!files) {
    const error = new Error('Please choose files')
    error.httpStatusCode = 400
    return next(error)
  }

  const folderUplod = fs.readdirSync(uploadPath);
  let filesContent = [];
  folderUplod.forEach(file => {

    let uploadDate = file.split('_')[0];
    let fileName = file.split('_').slice(1,).join('_');

    filesContent.push({uploadDate:uploadDate,fileName:fileName});

  })
  res.send(filesContent);
 
})