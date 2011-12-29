
/**
 * Module dependencies.
 */

var express = require('express');

var app = module.exports = express.createServer();

// Mongoose
var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost/blog');

var BlogPost = new Schema(
  {
    date: Date,
    title: String, 
    body: String,
    tags: [{tag: String}]
  }
);

var Post = mongoose.model('BlogPost',BlogPost);


// Passport

/*
var passport = require('passport')
  , TwitterStrategy = require('passport-twitter').Strategy;

TWITTER_CONSUMER_KEY = "aFOy68ER3IonveqQOQcUA";
TWITTER_CONSUMER_SECRET = "ooeVQTDsq7xHTLG3R9OGe3l3tQKEIpZM67vPA7oXc";

passport.use(new TwitterStrategy({
    consumerKey: TWITTER_CONSUMER_KEY,
    consumerSecret: TWITTER_CONSUMER_SECRET,
    callbackURL: "http://local.dev:3000/auth/twitter/callback"
  },
  function(token, tokenSecret, profile) {
    **User.findOrCreate(..., function (err, user) {
      if (err) { return done(err); }
      done(null, user);
    });**
    console.log(profile);
  }
));*/


var passport = require('passport')
  , GoogleStrategy = require('passport-google').Strategy;

passport.use(new GoogleStrategy({
    returnURL: 'http://local.dev:3000/auth/google/return',
    realm: 'http://local.dev:3000/'
  },
  function(identifier, profile, done) {
    /*User.findOrCreate({ openId: identifier }, function (err, user) {
      done(err, user);
    });*/

    //console.log(profile);
    //console.log(identifier);
    //console.log(done);
    return done(null,profile);
  }
));

passport.serializeUser(function(user, done) {
  console.log(user);
  done(null, user);
});

passport.deserializeUser(function(id, done) {
  /*User.findOne(id, function (err, user) {
    done(err, user);
  });*/
});


// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({secret: 'this is my secret string'}));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res){
  var posts;
  var postsCount;
  Post.count({},function(err,count){
    postsCount=count;
    console.log(count);
  });

  Post.where().limit(10).sort('date',-1).run(function (err,docs){
    res.render('index', {
      title: 'Express',
      test: 'blah',
      posts: docs,
      postCount: postsCount
    });
  });
  //console.log(posts);
  
});

app.post('/', function(req, res){
  post = new Post();
  post.body = req.body.postbody;
  post.title = req.body.posttitle;
  post.tags = req.body.tags.split(',');
  console.log(req.body);
  post.date = new Date();
  post.save(function (err) {
    if (!err) console.log('Success!');
  });
  res.render('new', {
    title: 'New post saved', post: post
  });
});

app.get('/add', function(req,res){
  res.render('postform', {
    title: 'New Post'
  });
});

app.get('/post/:id', function (req,res){
  var post; 
  Post.findById(req.params.id,function(err,doc){
    post = doc;
    res.render('post', {
      title: post.title,
      body: post.body,
      tags: post.tags
    });
  });
  
});


app.get('/login', function(req,res){
  res.render('login', {
    title: 'Login'
  });
});

app.get('/auth/google', passport.authenticate('google'));


app.get('/auth/google/return', 
  passport.authenticate('google', { successRedirect: '/',
                                     failureRedirect: '/login' }));



app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
