const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.enable('trust proxy');
app.use(function(req, res, next){
 if(req.secure){
  next();
 }else{
  res.redirect("https://" + req.headers.host + req.url);
 }
});
app.use(express.static(path.join(__dirname, 'build')));

app.get('*', function (req, res) {
 res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT);
