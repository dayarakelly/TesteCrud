const express = require('express');
const router = express.Router();
const app = express();         
const bodyParser = require('body-parser');
const port = 3000; //porta padrão

const pg = require('pg');

//configurando o body parser para pegar POSTS mais tarde
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:bancok@localhost:5432/testes';
const client = new pg.Client(connectionString);
client.connect();

router.get('/', (req, res) => res.json({ message: 'Funcionando!' }));
app.use('/', router);

//definindo as rotas//definindo as rotas
router.get('/api/v1/todos', (req, res, next) => {
  const results = [];
  // Grab data from http request
  const data = {text: req.body.text, complete: false};
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Insert Data
    client.query('INSERT INTO receitas(titulo, descricao) values($1, $2)',
    ['Salada', 'Vegetais variados']);
    // SQL Query > Select Data
    const query = client.query('SELECT * FROM receitas ORDER BY id ASC');
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});
//

router.get('/api/v1/update/:todo_id/:titulo/:descricao', (req, res, next) => {
  const results = [];
  // Grab data from the URL parameters
  const id = req.params.todo_id;
   const titulo = req.params.titulo;
    const descricao = req.params.descricao;
  // Grab data from http request
  const data = {text: req.body.text, complete: req.body.complete};
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Update Data
    client.query('UPDATE receitas SET titulo=($1), descricao=($2) WHERE id=($3)',
    [titulo, descricao, id]);
    // SQL Query > Select Data
    const query = client.query("SELECT * FROM receitas ORDER BY id ASC");
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', function() {
      done();
      return res.json(results);
    });
  });
});
//PESQUISA
router.get('/api/v1/search/:pesquisa', (req, res, next) => {
  const results = [];
  // Grab data from the URL parameters
  //const id = req.params.pesquisa;
   const value = req.params.pesquisa;
   
  // Grab data from http request
  const data = {text: req.body.text, complete: req.body.complete};
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Update Data
    console.log(value)
    // SQL Query > Select Data
    const query = client.query('SELECT * FROM receitas WHERE id=($1)',[value] );
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', function() {
      done();
      return res.json(results);
    });
  });
});

//

router.get('/api/v1/todos/:todo_id', (req, res, next) => {
  const results = [];
  // Grab data from the URL parameters
  const id = req.params.todo_id;
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Delete Data
    client.query('DELETE FROM receitas WHERE titulo=($1)', [id]);
    // SQL Query > Select Data
    var query = client.query('SELECT * FROM receitas ORDER BY id ASC');
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});






app.use('/', router);

app.listen(port);
console.log('API funcionando!');