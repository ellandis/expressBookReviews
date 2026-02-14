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

const authenticatedUser = (username, password) => {
    let validUser = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    if(validUser.length > 0){
        return true;
    }else{
        return false;
    }
}

const doesExist = (username) => {
    let userWithSameName = users.filter((u) => {
    return u.username === username});

    if(userWithSameName.length > 0){
        return true;
    }
    else {
        return false
    }
}

function checkUserExists(username) {
    return new Promise((resolve,reject) => {
        setTimeout( () => { resolve(doesExist(username)); }, 100);
    });
}

function createUser(userData){
    return new Promise((resolve,reject) => {
        setTimeout( () => users.push(userData), resolve(userData), 100);
    });
}

//async/wait
async function getBookISBN(isbn){
    try {
        const response = await axios.get(`http://localhost:8000/books/${isbn}`);
        return response.data;
    }
    catch(error) {
        throw new Error("Book not found");
    }
}

// async/await
const getBooks = async () => {
    try{
        const res = await axios.get('http://localhost:8000/books');
        return res.data;
    }
    catch(error){
        throw new Error("Books not found: " + error.message);
    }
}

async function getBooksByAuthor(authorName){
        try{
            const response = await axios.get(`http://localhost:8000/books/${authorName}`);
            return response.data;
        }
        catch(error){
            throw new Error('Author not found');
        }
    }

async function getBooksByTitle(titleName){
        try{
            const response = await axios.get(`http://localhost:8000/books/title/${titleName}`);
            return response.data;
        }
        catch(error){
            throw new Error("Book not found");
        }
    }

/*******************************
API ENDPOINT HELPERS => AXIOS
********************************/


public_users.get('/books',(req,res) => {
    return res.status(200).json(books);
});

public_users.get('/books/:isbn',(req,res) => {
        const isbn = req.params.isbn;
        const book = books[isbn];

        if(book) {
            return res.status(200).json(book);
        }
        else {
            return res.status(404).json({ message: "Book not found" });
        }
});

public_users.get('/author/:author',(req,res) => {
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

public_users.get('/title/:title', (req,res) => {
    const bookName = req.params.title;
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


public_users.post("/register", async (req,res) => {
  //Write your code here
    try {
        const userName = req.body.username;
        const passWord = req.body.password;

        if(!userName || !passWord){
            return res.status(400).json({message: "Username and password Required"});
        }

        const userExists = await checkUserExists(userName);

        if(userExists){
        return res.status(409).json({message: "User already exist"});
        }

        await createUser({username: userName, password: passWord});
        return res.status(201).json({message:"User successfully register. Now you can login"});
    }
    catch(error){
        console.error("Registration error: ", error);
        return res.status(500).json({message:"Registration failed", error: error.message});
    }
});


// Get the book list available in the shop
// async/await
public_users.get('/', async (req, res) => {
    getBooks().then(
        (booklist) => {
            return res.status(200).send(JSON.stringify(booklist,null,4));
        }).catch((error) => {
            return res.status(404).json({
                message: 'Error retrieving books',
                error: error.message
            });
        });
});

// Get book details based on ISBN
//async/wait
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
//next
public_users.get('/author/:author',async (req, res) => {
    try{
        const authorName = req.params.author;
        const allBooks = await getBooksByAuthor(authorName);

        if(!allBooks || allBooks.length === 0){
            return res.status(404).json({message: "No books found for this author"})
        }

        return res.status(200).send(JSON.stringify(allBooks,null,4));
    }catch(error){
            res.status(500).json({message:"Book not found", error: error.message});
    }
});

// Get all books based on title
//next
public_users.get('/title/:title', async (req, res) => {
    try{
        const titleName = req.params.title;
        const allBooks = await getBooksByTitle(titleName);

        if(!allBooks || allBooks.length === 0){
            return res.status(404).json({message:"No books found by that title."})
        }
        return res.status(200).send(JSON.stringify(allBooks,null,4));
    }
    catch(error){
        res.status(500).json({message:"Book not found", error: error.message});
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  const book = books[isbn];
  const review = book["reviews"];

  res.send(JSON.stringify(review,null,4));
});


module.exports.general = public_users;
