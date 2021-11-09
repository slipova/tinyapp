//making it possible to make HTTP requests on port 8080

const express = require("express");
const app = express();
const PORT = 8080;

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//place before  app.get("/urls/:id", ...) ORDER MATTERS
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {//longURL?
  const templateVars = { shortURL: req.params.shortURL, longURL: req.body.longURL };
  res.render("urls_show", templateVars);
});

//create a random shortURL
app.post("/urls", (req, res) => {
  let short = generateRandomString();
  let long = req.body.longURL;
  urlDatabase[short] = req.body.longURL;
  res.render("urls_show", { shortURL: short, longURL: long });
});

//urls_show
app.get("/u/:shortURL", (req, res) => { //displaying new page
  console.log('req.params', req.params);
  const longURL = urlDatabase[req.params.shortURL];
  if (longURL) {
    res.redirect(longURL);
  } else {
    // res.redirect("/urls");

    return res.send('<p>This URL does not exist</p>');
  }

});

//deleting a key-value pair   DOESNT WORK
app.post("/urls/:shortURL/delete", (req, res) => {  //handling request
  const urlToDelete = req.params.shortURL;
  console.log(urlToDelete)
  delete urlDatabase[urlToDelete];
  res.redirect("/urls");
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//Generate a random short name for the link
const generateRandomString = () => {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
};