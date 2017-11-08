var express = require('express');
var request = require('request');
var mongoose= require('mongoose');

var options = { server: { socketOptions: {connectTimeoutMS: 30000 } }};
mongoose.connect('mongodb://noel:movies@ds149855.mlab.com:49855/mymoviesapp', options , function(err) {
  console.log(err);
});

var movieSchema = mongoose.Schema({
  poster_path: String,
  overview: String,
  title: String,
  idMovieDB: Number
});

var movieModel = mongoose.model("movie", movieSchema);

var app = express();
app.set('view engine', 'ejs');

app.use(express.static('public'))

app.get('/', function (req, res) {
  request("https://api.themoviedb.org/3/discover/movie?api_key=1ca44169216245030924859d77648835&language=fr-FR&region=FR&sort_by=popularity.desc&include_adult=false&include_video=false&page=1", function(error, response, body){
    body = JSON.parse(body);
    console.log(body.results);

    var query = movieModel.find();
    query.exec(function(error, datas){
      res.render('home', {moviesList: body.results, moviesLike:datas, displayLike:true});
    })

  })

});

app.get('/review', function (req, res) {
  var query = movieModel.find();
  query.exec(function(error, datas){
     res.render('home', {moviesList: datas, moviesLike:[], displayLike:false});
  })

});

app.get('/contact', function (req, res) {
  res.render('contact');
});

app.get('/likemovie', function (req, res) {
  request("https://api.themoviedb.org/3/movie/"+req.query.id+"?api_key=1ca44169216245030924859d77648835&language=fr-FR", function(error, response, body){
    body = JSON.parse(body);

    var movie = new movieModel({
      poster_path: body.poster_path,
      title: body.title ,
      overview: body.overview,
      idMovieDB: body.id
    });
    movie.save(function(error, data){
      res.redirect('/');
    })

  })


});

var port = process.env.PORT || 8080;
app.listen(port, function () {
  console.log("Server listening on port 8080");
});
