var express = require('express');
var app = express();
var request = require('request');
var mongoose= require('mongoose');
app.set('view engine', 'ejs');
app.use(express.static('public'));


var options = { server: { socketOptions: {connectTimeoutMS: 30000 } }};
mongoose.connect('mongodb://nacer:password@ds249025.mlab.com:49025/moviz', options , function(err) {
  console.log(err);
});

mongoose.connect('mongodb://nacer:password@ds149535.mlab.com:49535/movizfav', options , function(err) {
  console.log(err);
});


var movieSchema = mongoose.Schema({
    name: String,
    synopsis: String,
    price: String,
    poster: String,
    id: Number,
    position: Number,
});


var movieModel = mongoose.model('movie', movieSchema);

request("https://api.themoviedb.org/3/discover/movie?api_key=4e4c3ca7449eeac7f1b497d2d9b45f70&language=fr-FR&sort_by=popularity.desc&include_adult=false&include_video=false&page=1", function(error, response, body) {
   body = JSON.parse(body);


   var query = movieModel.find();
   query.sort({position: 1});
   query.exec(function (err, datas) {
       for (i=0; i<body.results.length; i++) {

              var movie = new movieModel ({
              name: body.results[i].title,
              synopsis: body.results[i].overview,
              price: "5€",
              poster: "https://image.tmdb.org/t/p/w500/"+body.results[i].poster_path,
              id: body.results[i].id,
              position: i})


    //condition 1
    if (datas.length>0) {
      for (j=0; j<datas.length; j++)
      {
          if (movie.id !== datas[j].id) {movie.save(function (error, movie) {})}
          if (movie.id == datas[j].id) {movieModel.remove({id: datas[j].id}, function(error) {})}
  }};

    //condition 2

      if (datas.length == 0) { movie.save(function (error, movie) {})} //mon else est fermé

    }; //boucle for i

      });
      });



app.get('/', function (req, res, next) {
        var query = movieModel.find();
        query.sort({position: 1});
        query.exec(function (err, datas) {
        res.render('home', {movieList: datas});
            });
          });


app.get('/home', function (req, res, next) {
  var query = movieModel.find();
  query.exec(function (err, datas) {
    var query2 = favmovieModel.find();
    query2.exec(function (err, fav){
  res.render('home', {movieList: datas}, {favmoviesList: fav});
});
      });
    });

app.get('/signin', function (req, res, next) {
     res.render('signin');
  })


app.get('/contact', function (req, res, next) {
     res.render('contact');
  })

  app.get('/confirm', function (req, res, next) {
       res.render('confirm');
    })


  app.get('/contact', function (req, res, next) {
       res.render('contact');
    })


var favmovieSchema = mongoose.Schema({
        name: String,
        synopsis: String,
        price: String,
        poster: String,
        id: Number,
    });

var favmovieModel = mongoose.model('favmovie', favmovieSchema);

app.get('/review', function (req, res, next) {
  var query = favmovieModel.find();
  query.exec(function (err, datas) {
    res.render('review', {favmoviesList : datas})
  });
});


app.get('/reviewadd', function (req, res, next) {
        var movieID = req.query.id;
        movieModel.find( {id: req.query.id } , function (err, movies) {
          var favmovie = new favmovieModel ({
          name: movies[0].name,
          synopsis: movies[0].synopsis,
          price: "5€",
          poster: movies[0].poster,
          id: movies[0].id});


          var query = favmovieModel.find();
          query.exec(function (err, datas) {

            //condition 1
            if (datas.length>0) {
              for (j=0; j<datas.length; j++)
              {
                  if (favmovie.id !== datas[j].id) {favmovie.save(function (error, movie) {})}
                  if (favmovie.id == datas[j].id) {favmovieModel.remove({id: datas[j].id}, function(error) {})}
          }};

            //condition 2

              if (datas.length == 0) { favmovie.save(function (error, movie) {})};
                console.log(datas);


            });


          }); //113
          var query = movieModel.find();
          query.exec(function (err, datas) {
          res.render('home', {movieList: datas});
              });

});  //111

app.get('/reviewdelete', function (req, res, next) {
  favmovieModel.remove({id: req.query.id}, function(error) {
    var query = favmovieModel.find();
    query.exec(function (err, datas) {
       res.render('review', {favmoviesList: datas});
    })
  });

});


app.listen(8080, function () {
  console.log("Server listening on port 8080");
});
