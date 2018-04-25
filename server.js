'use strict';

const cors = require('cors');
const pg = require('pg');
const fs = require('fs');
const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL;

const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

app.use(cors());
app.get('/', (req, res) => res.redirect(CLIENT_URL));
app.get('/test/*', (req, res) => res.send('404'));

app.get('/api/v1/books', (req, res) => {
  client.query(`SELECT * from books;`)
    .then(results => res.send(results.rows))
    .catch(console.error);
});

app.post('/books', (request, response) => {
  client.query(
    `INSERT INTO
    books(author, title, isbn, image_url, description)
    VALUES ($1, $2, $3, $4, $5);
    `,
    [
      request.body.author,
      request.body.title,
      request.body.isbn,
      request.body.image_url,
      request.body.description
    ]
  )
    .then(function () {
      response.send('insert complete');
    })
    .catch(function (err) {
      console.error(err);
    });
});

app.put('/books/:id', (request, response) => {
  client.query(
    `UPDATE books
    SET 
    author=$1, title=$2, isbn=$3, image_url=$4, description=$5
    WHERE book_id=$6;
    `,
    [
      request.body.author,
      request.body.title,
      request.body.isbn,
      request.body.image_url,
      request.body.description,
      request.params.id
    ]
  )
    .then(() => {
      response.send('update complete');
    })
    .catch(err => {
      console.error(err);
    });
});

app.delete('/books/:id', (request, response) => {
  client.query(
    `DELETE FROM books WHERE book_id=$1;`,
    [request.params.id]
  )
    .then(() => {
      response.send('Delete complete');
    })
    .catch(err => {
      console.error(err);
    });
});

app.delete('/books', (request, response) => {
  client.query(
    'DELETE FROM books'
  )
    .then(() => {
      response.send('Delete complete');
    })
    .catch(err => {
      console.error(err);
    });
});

function loadBooks() {
  client.query('SELECT COUNT(*) FROM books')
    .then(result => {
      if (!parseInt(result.rows[0].count)) {
        fs.readFile('../book-list-client/data/books.json', 'utf8', (err, fd) => {
          JSON.parse(fd).forEach(ele => {
            client.query(`
            INSERT INTO
            books(author, title, isbn, image_url, description)
            VALUES ($1, $2, $3, $4, $5);
          `,
              [ele.author, ele.title, ele.isbn, ele.image_url, ele.description]
            );
          });
        });
      }
    });
}

loadDB();
app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));

function loadDB() {
  client.query(`
    CREATE TABLE IF NOT EXISTS
    books(
      book_id SERIAL PRIMARY KEY,
      author TEXT NOT NULL,
      title VARCHAR(255) NOT NULL,
      isbn VARCHAR(255),
      image_url VARCHAR(255),
      description TEXT NOT NULL
    );`
  )
    .then(loadBooks)
    .catch(console.error);
}

/*
CREATE DATABASE book_app;

CREATE TABLE books;

CREATE TABLE books ( book_id SERIAL PRIMARY KEY, author TEXT, title TEXT, isbn VARCHAR(20), image_url VARCHAR(255), description TEXT );

*/