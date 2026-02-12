const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
    let foundUser = users.filter( (user) => user.username === username);
    if(foundUser.length > 0){ return true;}
    else{ return false;}
}

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

//only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const passWord = req.body.password;

    if (!username || !passWord) {
        return res.status(400).json({message: "Username and password required"});
    }

    if (authenticatedUser(username, passWord)) {
        let accessToken = jwt.sign({
            data: username  // Use username, not password
        }, 'access', {expiresIn: 60 * 60});

        req.session.authorization = {accessToken, username};

        return res.status(200).json({
            message: "User successfully logged in",
            user: username,
            timestamp: new Date(),
            accessToken
        });
    } else {
        return res.status(401).json({message: "Invalid Login. Check username and password"});
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;
    const review = req.body.review;

    if(!books[isbn]){
        return res.status(404).json({message:"Book not found"});
    }

    let note = "";
    if(books[isbn].reviews[username] === username.username){
        note = `Review ADDED by ${username} on book ${isbn}`
    }
    else{
        note = `Review UPDATED by ${username} on book ${isbn}`
    }

    books[isbn].reviews[username] = review;

    return res.status(200).json({
        message: note
    });
});


regd_users.delete("/auth/review/:isbn", (req,res) => {

    const isbn = req.params.isbn;
    const username = req.session.authorization.username;

    if(books[isbn].reviews[username]){
        delete books[isbn].reviews[username];
        return res.status(200).json({message: "Review deleted successfully"});
    }else {
        return res.status(404).json({ message: "You have no review to delete for this book" });
    }

});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
