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
regd_users.post("/login", (req,res) => {
    const userName = req.body.username;
    const passWord = req.body.password;

    if(!userName || !passWord){return res.status(404).json({message:"Error logging in"});}

    if(authenticatedUser(userName,passWord)){
        let accessToken = jwt.sign({
            data: passWord,
        }, 'access',{expiresIn: 60 * 60});

        req.session.authorization = {accessToken, userName};

        return res.status(200).json({
            success: true,
            message: "User successfully registered. Now you can login",
            user: userName,
            timestamp: new Date(),
            accessToken
        });
    }
    else {
        return res.status(208).json({message: "Invalid Login. Check username and password"});
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
    const isbn = req.params.isbn;
    const username = req.session.authorization.userName;
    const review = req.body.review;

    if(!books[isbn]){
        return res.status(404).json({message:"Book not found"});
    }

    let note = "";
    if(books[isbn].reviews[username] === username){
        note = `Review updated for ${username} on ${isbn}`
    }
    else{
        note = `Review added for ${username} on ${isbn}`
    }

    books[isbn].reviews[username] = review;


    return res.status(200).json({
        message: note
    });

});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
