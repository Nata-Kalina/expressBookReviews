const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req,res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }
    
    if (users[username]) {
        return res.status(409).send('Username already exists');
    }
    
    users.push({"username":username,"password":password });
    return res.status(201).json({message: 'User registered successfully'});

});

const allBooks = new Promise((resolve,reject) => {
      resolve(books);
    });


// Get the book list available in the shop
public_users.get('/', async (req, res) => {
    try {
        const response = await allBooks;
        return res.send(JSON.stringify(response, null, 4));     
    } catch (error) {
        return res.status(404).json({message: "Books not found"})
  }
});



// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;
    try {
        const response = await allBooks;
        return res.send(JSON.stringify(response[isbn]));     
    } catch (error) {
        return res.status(404).json({message: "No books found by that ISBN"})
  }
    });
  
// Get book details based on author
public_users.get('/author/:author',async function (req, res) {
    const author = req.params.author.replace(/-/g, ' ');
    const booksByAuthor = [];
    try {
        const response = await allBooks;
        Object.keys(response).forEach(key => {
        if (response[key].author.toLowerCase().replace(/,/g, '') == author) {
            booksByAuthor.push(response[key]);
        }})

        if (booksByAuthor.length > 0) {
          return res.send(booksByAuthor);
          } else {
           return res.status(404).send('No books found by that author');
          }
    } catch (error) {
        return res.status(500).json({message: 'Something went wrong'})
  }
  });

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title.replace(/-/g, ' ');
    const booksByTitle = [];
    try {
        const response = await allBooks;
        Object.keys(response).forEach(key => {
        if (response[key].title.toLowerCase().replace(/,/g, '') == title) {
            booksByTitle.push(response[key]);
        }})

        if (booksByTitle.length > 0) {
          return res.send(booksByTitle);
          } else {
           return res.status(404).send('No books found by that title');
          }
    } catch (error) {
        return res.status(500).send('Something went wrong');
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;

    if (books[isbn]) {
        const reviews = books[isbn].reviews;
        return res.status(200).send(reviews);
      } else {
        return res.status(404).send('Book not found for the provided ISBN');
      }
});

module.exports.general = public_users;
