const express = require("express");
const bodyParser = require("body-parser");
// const mongoose = require("mongoose");
// const session = require("express-session");
// const passport = require("passport");
// const passportLocalMongoose = require("passport-local-mongoose");
const ejs  = require("ejs");

const app = express();

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

app.get("/register", (req,res)=>{
    res.render("register");
});

app.listen(3000,()=>{
    console.log("server running on port 3000");
});