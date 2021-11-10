//making it possible to make HTTP requests on port 8080

const express = require("express");
const app = express();
const PORT = 8080;

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

const cookieParser = require("cookie-parser");
app.use(cookieParser());


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


//------------------------------------------------//

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></html>\n");
});


app.get("/urls", (req, res) => {
  // store variables in on object to be able to refer to them in the file - urls_index in this case
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});

//place before  app.get("/urls/:id", ...) ORDER MATTERS
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
  };
  res.render("urls_new", templateVars);
});
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//

//new URL
app.get("/urls/:shortURL", (req, res) => {//longURL?
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"] };
  console.log(templateVars);
  res.render("urls_show", templateVars);
});

//create a random shortURL------CHECK send above?
app.post("/urls", (req, res) => {
  let short = generateRandomString();
  let long = req.body.longURL;
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

//login post request COOKIES
app.post("/login", (req, res) => {
  //set a cookie named username to the value submitted in the request body via the login form
  const username = req.body.username;
  // console.log(req.body);
  res.cookie("username", username);
  // console.log(username);
  res.redirect("/urls");

  //-----pass username-------//
  const templateVars = {
    username: req.cookies["username"],
  };
  res.render("urls_index", templateVars);
});
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//

//submit form from Tiny page
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const newURL = req.body.newurl; //name is important
  urlDatabase[shortURL] = newURL;
  res.redirect("/urls")
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

//logout NOT WORKING
app.post("/logout", (req, res) => {  //handling request
  // const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  // res.render("urls_index", templateVars);

  res.clearCookie("username");
  res.redirect("/urls");

});
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-//




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//Generate a random short name for the link
const generateRandomString = () => {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
};