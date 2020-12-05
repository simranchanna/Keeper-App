const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const ejs  = require("ejs");

const app = express();

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: 'thisisatopsecret',
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/keeperDB" , { useNewUrlParser: true , useUnifiedTopology: true});
mongoose.set('useCreateIndex', true);

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    list: [String]
});


userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User",userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

function getDayofWeek(){
    var today = new Date();
    let options = { weekday: 'long', month: 'long', day: 'numeric' };
    var day = today.toLocaleDateString("en-US",options);    
    return day;
}

app.get("/",(req,res)=>{
    if(req.isAuthenticated()){
        var day = getDayofWeek();
        User.findById(req.user.id , function(err,foundUser){
            if(err){
                console.log(err);
            }
            else{
                if(foundUser){
                    res.render("home",{kindofDay : day , todosList : foundUser.list});
                }
            }
        })
    }
    else{
        res.redirect("/login");
    }
});

app.get("/register", (req,res)=>{
    res.render("register");
});

app.get("/login", (req,res)=>{
    res.render("login");
});

app.post("/register" , (req,res)=>{
    User.register({name: req.body.name , username: req.body.username}, req.body.password , function(err, user) {
        if (err) { 
            console.log(err);
            res.redirect("/register");
        }
        else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/");
            })
        }    
    });
});

app.post("/login", (req,res)=>{

    const user = new User({
        username: req.body.username,
        password: req.body.password
    });
    req.login(user , function(err){
        if(err){
            console.log(err);
        }
        else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/");
            })
        }
    })
});

app.post("/", (req,res)=>{
    const todo = req.body.todo;

    User.findById(req.user.id , function(err,foundUser){
        if(err){
            console.log(err);
        }
        else{
            if(foundUser){
                foundUser.list.push(todo);
                foundUser.save(function(){
                    res.redirect("/");
                })
            }
        }
    })
})

app.listen(3000,()=>{
    console.log("server running on port 3000");
});