const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

/*
**********************************************
helper functions
**********************************************
*/

const doesExist = (username) => {
    let userWithSameName = users.filter((u) => {
        return u.username === username
    });
    return userWithSameName.length > 0;
}

async function createUser(userData){
    users.push({
        username: userData.username,
        password: userData.password
    });
    return true;
}

//async/await
async function getBookISBN(isbn){
    try {
        const response = await axios.get(`http://localhost:8000/api/books/${isbn}`);
        return response.data;
    }
    catch(error) {
        throw new Error("Book not found");
    }
}

// async/await
const getBooks = async () => {
    try{
        const res = await axios.get(`http://localhost:8000/api/books`);
        return res.data;
    }
    catch(error){
        throw new Error("Books not found: " + error.message);
    }
}

async function getBooksByAuthor(authorName){
    try{
        const response = await axios.get(`http://localhost:8000/api/author/${authorName}`);
        return response.data;
    }
    catch(error){
        throw new Error('Author not found');
    }
}

async function getBooksByTitle(titleName){
    try{
        const response = await axios.get(`http://localhost:8000/api/title/${titleName}`);
        return response.data;
    }
    catch(error){
        throw new Error("Book not found");
    }
}

/*******************************
API ENDPOINT HELPERS => AXIOS
********************************/

public_users.get('/api/books', (req, res) => {
    return res.status(200).json(books);
});

public_users.get('/api/books/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    const book = books[isbn];

    if(book) {
        return res.status(200).json(book);
    }
    else {
        return res.status(404).json({ message: "Book not found" });
    }
});

public_users.get('/api/author/:author', (req, res) => {
    const authorName = req.params.author;
    const booksByAuthor = [];

    for(let isbn in books){
        if(books[isbn].author.toLowerCase() === authorName.toLowerCase()){
            booksByAuthor.push(books[isbn]);
        }
    }

    if(booksByAuthor.length === 0){
        return res.status(404).json({message: "No books found for this author"})
    }
    return res.status(200).json(booksByAuthor);
});

public_users.get('/api/title/:title', (req, res) => {
    const titleName = req.params.title;

    for(let isbn in books){
        if(books[isbn].title.toLowerCase() === titleName.toLowerCase()){
            return res.status(200).json({
                isbn: isbn,
                ...books[isbn]
            });
        }
    }
    return res.status(404).json({message: "Book not found"});
});

/*************
********API FUNCTIONS***********
**********/

public_users.post("/register", async (req, res) => {
    try {
        const userName = req.body.username;
        const passWord = req.body.password;

        if(!userName || !passWord){
            return res.status(400).json({message: "Username and password Required"});
        }

        // Check if user already exists
        if(doesExist(userName)){
            return res.status(409).json({message: "User already exists"});
        }

        // Add user to the array
        users.push({
            username: userName,
            password: passWord
        });

        return res.status(201).json({message: "User successfully registered. Now you can login"});
    }
    catch(error){
        console.error("Registration error: ", error);
        return res.status(500).json({message: "Registration failed", error: error.message});
    }
});

// Get the book list available in the shop
public_users.get('/', async (req, res) => {
    getBooks()
        .then((booklist) => {
            return res.status(200).send(JSON.stringify(booklist, null, 4));
        })
        .catch((error) => {
            return res.status(404).json({
                message: 'Error retrieving books',
                error: error.message
            });
        });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
    try {
        const isbn = req.params.isbn;
        const book = await getBookISBN(isbn);
        return res.status(200).send(JSON.stringify(book, null, 4));
    }
    catch(error) {
        return res.status(404).json({
            message: "Book not found",
            error: error.message
        });
    }
});

// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
    try{
        const authorName = req.params.author;
        const allBooks = await getBooksByAuthor(authorName);

        if(!allBooks || allBooks.length === 0){
            return res.status(404).json({message: "No books found for this author"})
        }

        return res.status(200).send(JSON.stringify(allBooks, null, 4));
    }
    catch(error){
        res.status(500).json({message:"Book not found", error: error.message});
    }
});

// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
    try{
        const titleName = req.params.title;
        const allBooks = await getBooksByTitle(titleName);

        if(!allBooks || allBooks.length === 0){
            return res.status(404).json({message:"No books found by that title."})
        }
        return res.status(200).send(JSON.stringify(allBooks, null, 4));
    }
    catch(error){
        res.status(500).json({message:"Book not found", error: error.message});
    }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    const review = book["reviews"];

    res.send(JSON.stringify(review, null, 4));
});

module.exports.general = public_users;