const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser())
const { checkEmail } = require('./helpers')

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "8rvcfl"},
  "9sm5xK": {longURL: "http://www.google.com", userID: "5xn69m"}
};

const users = { 
  "8rvcfl": {
    id: "8rvcfl", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "5xn69m": {
    id: "5xn69m", 
    email: "user2@example.com", 
    password: "aaa bbb ggg"
  }
}

function generateRandomString() {
  return Math.random().toString(36).substring(2,8);

}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { user: req.cookies["user_id"] ? users[req.cookies["user_id"]] : null, urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const newUser = req.cookies["user_id"];
  if (newUser) {
    const templateVars = { user: users[req.cookies["user_id"]] };
    res.render("urls_new", templateVars);

  } else {
    res.redirect('/login')
  }
  
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { user: req.cookies["user_id"] ? users[req.cookies["user_id"]] : null, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL};
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);         
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL].longURL = req.body.newlongURL;
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  const {email, password} = req.body;
  const user = checkEmail(users, email);
  if(user) {
    if (user.password === password) {
      res.cookie('user_id', user.id);
      res.redirect('/urls'); 
    } else {
      res.status(403).send("Wrong password");
    }

  } else {
    res.status(403).send("Couldn't find your account");
  }
  
           
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');         
});

app.get("/register", (req, res) => {
  res.render('registration', {user: req.cookies["user_id"] ? users[req.cookies["user_id"]] : null});         
});

app.post("/register", (req, res) => {
  const {email, password} = req.body;
  if(email && password) {
    if(checkEmail(users, email)) {
      res.status(400).send("Email already registered");

    } else {
      const id = generateRandomString();
      const user = {
        id,
        email,
        password
      }
      users[id] = user;
      res.cookie('user_id', id);
      console.log(users);
      res.redirect('/urls');  

    } 

  } else {
    res.statusCode = 400;
    res.status(400).send("Enter an email and password");
  }
       
});

app.get("/login", (req, res) => {
  res.render('login', {user: req.cookies["user_id"] ? users[req.cookies["user_id"]] : null});         
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});