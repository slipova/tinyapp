//making it possible to make HTTP requests on port 8080

const express = require("express");
const app = express();
const PORT = 8080;

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

const cookieParser = require("cookie-parser");
const e = require("express");
app.use(cookieParser());

////////////-+-+-+-+-+-+-+//////////////
//           URL DATABASE             //
////////////-+-+-+-+-+-+-+//////////////

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

////////////-+-+-+-+-+-+-+//////////////
//           USER DATABASE            //
////////////-+-+-+-+-+-+-+//////////////

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

//----------------------methods--------------------------//

app.get("/", (req, res) => {
  res.send("Hello!");
});
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></html>\n");
});
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//


app.get("/urls", (req, res) => {          //USER_ID
  // store variables in on object to be able to refer to them in the file - urls_index in this case
  const username = req.cookies["userID"];
  const userObj = users[username];
  const userEmail = userObj ? userObj.email : null;
  const templateVars = { urls: urlDatabase, user: userObj };
  res.render("urls_index", templateVars);
});
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//

//place before  app.get("/urls/:id", ...) ORDER MATTERS       ///USER_ID
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["userID"]],
  };
  res.render("urls_new", templateVars);
});
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//

//new URL
app.get("/urls/:shortURL", (req, res) => {//longURL?     ////USER_ID
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies["userID"]] };
  res.render("urls_show", templateVars);
});
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//

//create a random shortURL------CHECK send above?
app.post("/urls", (req, res) => {
  let short = generateRandomString();
  // let long = req.body.longURL;
  urlDatabase[short] = req.body.longURL;
  // res.render("urls_show", { shortURL: short, longURL: long, username: req.cookies["username"] });
  res.redirect(`/urls/${short}`);
});
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//

//urls_show file uses the path
app.get("/u/:shortURL", (req, res) => { //displaying new page
  const longURL = urlDatabase[req.params.shortURL];
  if (longURL) {
    res.redirect(longURL);
  } else {
    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    return res.send('<p>This URL does not exist</p>');
  }
});
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//

//login post request COOKIES
app.post("/login", (req, res) => {
  //set a cookie named username to the value submitted in the request body via the login form
  const username = req.body.username;
  if (users[username]) {
    res.cookie("userID", username);
  };
  res.redirect("/urls");
});
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//

//submit form from Tiny page
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const newURL = req.body.newurl; //name is important
  urlDatabase[shortURL] = newURL;
  res.redirect("/urls");
});
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//

//deleting a key-value pair from database
app.post("/urls/:shortURL/delete", (req, res) => {  //handling request
  const urlToDelete = req.params.shortURL;
  //access the object
  delete urlDatabase[urlToDelete];
  res.redirect("/urls");
});
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-//

//logout
app.post("/logout", (req, res) => {  //handling request
  res.clearCookie("userID");
  res.redirect("/urls");
});

//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-//


//=-=-=-=-=-////////////-=-=-=-=-//
//          REGISTRATION         //
//=-=-=-=-=-////////////-=-=-=-=-//

//render registration page
app.get("/register", (req, res) => {
  res.render("register");
});

//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-//

//post the REGISTRATION form MAKE SURE IT'S 'REGISTER' NOT 'REGISTRATION'
app.post("/register", (req, res) => {
  //console.log(req.body); { email: 'sdc@jvbj', password: 'sdcfsdf', register: '' }
  const { email, password } = req.body;

  if (email.length === 0 || password.length === 0) {
    return res.status(400).send('Bad Request');
  }
  if (!checkExistingEmails(email)) {
    return res.status(400).send('Bad Request');
  } else {
    const userID = 'user' + generateRandomString();
    users[userID] = { id: userID, email, password };
    //creates a cookie:
    res.cookie('userID', userID);
    res.redirect("/urls");
  }
  console.log(users)
});



//////HELPER FUNCTION/////////////
const checkExistingEmails = (newEmail) => {
  for (let key in users) {

    let userEmail = users[key]["email"];
    if (userEmail === newEmail) {
      return false;
    };
  }
  return true;
};

app.get("/login", (req, res) => {
  res.render("login");
});



///////////////////////////////////
///      SERVER LISTENING       ///
///////////////////////////////////

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-//

//GENERATE a random short name for the link
const generateRandomString = () => {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
};