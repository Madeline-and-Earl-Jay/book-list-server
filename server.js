'use strict';

const cors = require('cors');
const pg = require('pg');
const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL;

const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

app.use(cors());
app.get('/', (req, res) => res.redirect(CLIENT_URL));
app.get('*', (req, res) => res.redirect(CLIENT_URL));
app.get('/test/*', (req, res) => res.send('404'));

app.get('/api/v1/books', (req, res) => {
  client.query(`SELECT * from books;`)
    .then(results => res.send(results.rows))
    .catch(console.error);
});

app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));

/*
CREATE DATABASE book_app;

CREATE TABLE books;

CREATE TABLE books ( book_id SERIAL PRIMARY KEY, author TEXT, title TEXT, isbn VARCHAR(20), image_url VARCHAR(255), description TEXT );

*/