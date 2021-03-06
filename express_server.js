const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieSession = require('cookie-session');
app.use(
  cookieSession({
    name: 'session',
    keys: [
      'a2b14a14-3058-4fd6-a5a3-af1a35811c95',
      'ab119d51-2c95-4292-8e0e-e7c3533fb6de',
    ],
  })
);
const { getUserByEmail,urlsForUser } = require('./helpers');
const bcrypt = require('bcrypt');
const saltRounds = 10;
// Setting ejs as the template engine
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
};

function generateRandomString() {
  return Math.random().toString(36).substring(2,8);

}

app.get("/", (req, res) => {
  const newUser = req.session.user_id;
  if (newUser) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

//a list of URLs the user has created
app.get("/urls", (req, res) => {
  const newUser = req.session.user_id;
  if (newUser) {
    const newUrls = urlsForUser(newUser, urlDatabase);
    const templateVars = { user: users[newUser], urls: newUrls };
    res.render("urls_index", templateVars);

  } else {
    res.render("urls_index", {user: null});
    
  }
  
});

// a form for new URL
app.get("/urls/new", (req, res) => {
  const newUser = req.session.user_id;
  if (newUser) {
    const templateVars = { user: users[newUser] };
    res.render("urls_new", templateVars);

  } else {
    res.redirect('/login');
  }
  
});

// The short URL (for the given ID) and update option
app.get("/urls/:shortURL", (req, res) => {
  const newUser = req.session.user_id;
  if (newUser) {
    const tinyURL = req.params.shortURL;
    if (urlDatabase[tinyURL]) {
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

//generates a short URL, saves it, and associates it with the user
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  const user = req.session.user_id;
  if (user) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {"longURL" : req.body.longURL, "userID" : user};
    res.redirect(`/urls/${shortURL}`);

  } else {
    res.send("Create account or Sign in to continue");
  }
         
});

//redirects to the corresponding long URL
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  } else {
    res.send("Invalid Id");
  }
  
});

//if user is logged in and owns the URL for the given ID: deletes the URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const newUser = req.session.user_id;
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

//if user is logged in and owns the URL for the given ID: updates the URL
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const newUser = req.session.user_id;
  if (newUser) {
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

//login if email and password params match an existing user
app.post("/login", (req, res) => {
  const {email, password} = req.body;
  const user = getUserByEmail(email, users);
  if (user) {
    if (bcrypt.compareSync(password, users[user].password)) {
      req.session.user_id = users[user].id;
      res.redirect('/urls');
    } else {
      res.status(403).send("Wrong password");
    }

  } else {
    res.status(403).send("Couldn't find your account");
  }
  
           
});

//logout 
app.post("/logout", (req, res) => {
  req.session['user_id'] = null;
  res.redirect('/urls');     
});

// a form for creating an account
app.get("/register", (req, res) => {
  const newUser = req.session.user_id;
  if (newUser) {
    res.redirect('/urls');
  } else {
    res.render('registration', {user: null});

  }
          
});

// creates a new user
app.post("/register", (req, res) => {
  const {email, password} = req.body;
  if (email && password) {
    if (getUserByEmail(email, users)) {
      res.status(400).send("Email already registered");

    } else {
      const id = generateRandomString();
      const hashedPassword = bcrypt.hashSync(password, saltRounds);
      const user = {
        id,
        email,
        password : hashedPassword
      };
      users[id] = user;
      req.session.user_id = id;
      console.log(users);
      res.redirect('/urls');

    }

  } else {
    res.statusCode = 400;
    res.status(400).send("Enter an email and password");
  }
       
});

//login form
app.get("/login", (req, res) => {
  const newUser = req.session.user_id;
  if (newUser) {
    res.redirect('/urls');
  } else {
    res.render('login', {user: null});

  }
           
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});