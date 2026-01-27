const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
      res.send(JSON.stringify(books,null,4));

//  return res.status(300).json({message: "Yet to be implemented"});
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
    const isbn = req.params.isbn;
    const book = books[isbn];
    if(book){
        res.send(JSON.stringify(book,null,4));
    }
    else{
        res.status(400).json({message:"Book not found"});
    }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
    const authorName = req.params.author.toLowerCase();
    const allBooks = Object.values(books);
    const bookShelf = allBooks.filter( (bk) =>
        (bk.author.toLowerCase() === authorName)
   )
    res.send(JSON.stringify(bookShelf,null,4));

});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
    const titleName = req.params.title.toLowerCase();
    const allBooks = Object.values(books);
    const shelf = allBooks.filter((bk) =>
        (bk.title.toLowerCase() === titleName)
    )
    res.send(JSON.stringify(shelf,null,4));
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  const book = books[isbn];
  const review = book.reviews;

  res.send(JSON.stringify(review,null,4));
});

module.exports.general = public_users;
