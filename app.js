var express = require('express')
  , app = express()
  , pg = require('pg')
  , connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/bower'
  , port = process.env.PORT || 4000
  , client;

app.use(express.bodyParser());

client = new pg.Client(connectionString);
client.connect();

/* List all the Available Packages */
app.get('/packages', function(req, res) { 

  client.query("SELECT repo_name, repo_url FROM bower_repo", function(error, result) {
    if(result.rows.length > 0)
      res.send(200, JSON.stringify(result.rows));
    else
      res.send(201, 'Unknown Error');
  });

});

/* Search the Package Repository */
app.get('/packages/search/:name', function(req, res) {

  var pattern = '%' + req.param('name') + '%';

  client.query("SELECT repo_name, repo_url FROM bower_repo WHERE repo_name LIKE $1", [pattern], function(error, result) {
    if(result.rows.length > 0)
      res.send(200, JSON.stringify(result.rows));
    else
      res.send(201, 'Unknown Error');
  });

});

/* Add a new Package to Bower */
app.post('/packages', function(req, res) {
  
  var repo_name = req.body.name;
  var repo_url  = req.body.url;

  client.query("SELECT * FROM bower_repo WHERE repo_name = $1", [repo_name], function(error, result) {
    
    if(result.rows.length >= 1)
      res.send(406, 'Duplicate package');

    else if(repo_url.substring(0,6) != 'git://')
      res.send(400, 'Incorrect Format'); 
    
    else
    {
      client.query("INSERT INTO bower_repo(repo_name, repo_url, created_at) values($1, $2, $3)", [repo_name, repo_url, new Date()], function(error, result) {
      if(error)
        res.send(201, 'Unknown Error');
      else
        res.send(200, 'New Package Registered');
      });
    }

  });

});


app.listen(port, function() {
  console.log('Listening on:', port);
});