// Routes

app.get('/', function(req, res){
  var posts;
  Post.find({}, function (err,docs){
    res.render('index', {
      title: 'Express',
      test: 'blah',
      posts: docs
    });
  });
  //console.log(posts);
  
});

app.post('/', function(req, res){
  post = new Post();
  post.body = req.body.postbody;
  post.title = req.body.posttitle;
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