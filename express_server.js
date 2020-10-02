const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());
const { checkEmail,urlsForUser } = require('./helpers');
const bcrypt = require('bcrypt');
const saltRounds = 10;

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "8rvcfl"},
  "9sm5xK": {longURL: "http://www.google.com", userID: "5xn69m"}
};

const users = { 
  "8rvcfl": {
    id: "8rvcfl", 
    email: "user@example.com", 
    password: bcrypt.hashSync("purple-monkey-dinosaur", saltRounds)
  },
 "5xn69m": {
    id: "5xn69m", 
    email: "user2@example.com", 
    password: bcrypt.hashSync("aaa bbb ggg", saltRounds)
  }
}

function generateRandomString() {
  return Math.random().toString(36).substring(2,8);

}

app.get("/", (req, res) => {
  const newUser = req.cookies["user_id"];
  if (newUser) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const newUser = req.cookies["user_id"];
  if (newUser) {
    const newUrls = urlsForUser(newUser, urlDatabase);
    const templateVars = { user: users[newUser], urls: newUrls };
    res.render("urls_index", templateVars);

  } else {
    res.render("urls_index", {user: null});
    
  }
  
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
  const newUser = req.cookies["user_id"];
  if (newUser) {
    const tinyURL = req.params.shortURL;
    if(urlDatabase[tinyURL]){
      if (urlDatabase[tinyURL].userID === newUser) {
        const templateVars = { user: users[newUser], shortURL: tinyURL, longURL: urlDatabase[tinyURL].longURL};
        res.render("urls_show", templateVars);
  
      } else {
        res.send("Access not allowed");
      }

    } else {
      res.send("Invalid Id");
    }
    
    

  } else {
    res.send("Create account or Sign in to continue");
    
  }
  
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  const user = req.cookies["user_id"];
  if (user) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {"longURL" : req.body.longURL, "userID" : user};
    res.redirect(`/urls/${shortURL}`);  

  } else {
    res.send("Create account or Sign in to continue");
  }
         
});

app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]){
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  } else {
    res.send("Invalid Id");
  }
  
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const newUser = req.cookies["user_id"];
  if (newUser) {
    if (urlDatabase[req.params.shortURL].userID === newUser) {
      delete urlDatabase[req.params.shortURL];
      res.redirect('/urls');
  
    } else {
      res.send("Access not allowed");
    }

  } else {
    res.send("Create account or Sign in to continue");
  }
  

  
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const newUser = req.cookies["user_id"];
  if(newUser) {
    if (urlDatabase[shortURL].userID === newUser) {
      urlDatabase[shortURL].longURL = req.body.newlongURL;
      res.redirect('/urls');
    } else {
      res.send("Access not allowed");
    }

  } else {
    res.send("Create account or Sign in to continue");

  }
  
  
});

app.post("/login", (req, res) => {
  const {email, password} = req.body;
  const user = checkEmail(users, email);
  if(user) {
    if (bcrypt.compareSync(password, user.password )) {
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
  const newUser = req.cookies["user_id"];
  if (newUser) {
    res.redirect('/urls');
  } else {
    res.render('registration', {user: null}); 

  }
          
});

app.post("/register", (req, res) => {
  const {email, password} = req.body;
  if(email && password) {
    if(checkEmail(users, email)) {
      res.status(400).send("Email already registered");

    } else {
      const id = generateRandomString();
      const hashedPassword = bcrypt.hashSync(password, saltRounds);
      const user = {
        id,
        email,
        password : hashedPassword
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
  const newUser = req.cookies["user_id"];
  if (newUser) {
    res.redirect('/urls');
  } else {
    res.render('login', {user: null});

  }
           
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});