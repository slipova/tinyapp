//making it possible to make HTTP requests on port 8080

const express = require("express");
const app = express();
const PORT = 8080;

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const e = require("express");
const bcrypt = require("bcryptjs");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());


//////CALLBACK hash passwords////////
//req.params[apssword]
// const examplePass = "chgchgchgch";
// const hashPassword = bcrypt.hashSync(examplePass, 10, (err, hash) => {
//   console.log(hash);
// })
// hashPassword();

// bcrypt.hash(password, 10, function(err, hash) {

//   // Store hash in your password DB.
// });

////////////-+-+-+-+-+-+-+//////////////
//           URL DATABASE             //
////////////-+-+-+-+-+-+-+//////////////

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.bfbdfodnfg.ca",
    userID: "userRandomID"
  },
  AAAxQ: {
    longURL: "https://www.tsn.ca",
    userID: "user2RandomID"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "userRandomID"
  }
};



////////////-+-+-+-+-+-+-+//////////////
//           USER DATABASE            //
////////////-+-+-+-+-+-+-+//////////////

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "1234"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "2345"
  }
};
//////////////////////////////////////////////////////
///////////////-+-+-+-FUNCTIONS-+-+-+-////////////////
//////////////////////////////////////////////////////

//GENERATE a random short name for the link
const generateRandomString = () => {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
};
//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//

//RETURN an user's URLs in an object
const urlsForUser = (id) => {
  //  urlDatabase ---> shortURL ----> id
  console.log('THIS IS A FUNCTION');
  let userURLS = {};

  for (let shortURL in urlDatabase) {
    let user = urlDatabase[shortURL].userID;

    if (user === id) {
      userURLS[shortURL] = urlDatabase[shortURL].longURL;
      console.log(userURLS[shortURL]);
    }
  }
  return userURLS;
};

//------------------------------------------------------//
//----------------------ROUTES--------------------------//
//------------------------------------------------------//

app.get("/", (req, res) => {
  if (req.cookies["userID"]) {
    res.redirect("/urls");
  }
  res.redirect("/login");
});
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></html>\n");
});
//=-=-=-=-=-=-=-=-=-=-=-=-
app.get("/urls", (req, res) => {
  // store variables in an object to be able to refer to them in the file - urls_index in this case
  console.log("THIS IS /URLS - GET");
  if (!req.cookies["userID"]) {
    return res.status(400).send("You are not logged in");
  }
  const userID = req.cookies["userID"]; //??? is it useful?
  const userObj = users[userID];
  const urlUser = urlsForUser(userID);
  const templateVars = { urls: urlUser, user: userObj };
  res.render("urls_index", templateVars);

});
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//

//place before  app.get("/urls/:id", ...) ORDER MATTERS       ///USER_ID
app.get("/urls/new", (req, res) => {

  if (!req.cookies["userID"]) {
    return res.redirect("/login");
  }
  const templateVars = {
    user: users[req.cookies["userID"]],
  };
  res.render("urls_new", templateVars);

});
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//

//new URL
app.get("/urls/:shortURL", (req, res) => {
  if (!req.cookies["userID"]) {
    return res.status(401).send('Please log in');
  }

  if (Object.keys(urlsForUser(req.cookies["userID"])).includes(req.params.shortURL)) {
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      user: users[req.cookies["userID"]]
    };
    return res.render("urls_show", templateVars);
  }
  return res.status(401).send('Unauthorized');
});

//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//

//create a random shortURL
app.post("/urls", (req, res) => {
  let short = generateRandomString();
  let long = req.body.longURL;
  urlDatabase[short] = { longURL: long, userID: req.cookies["userID"] };
  res.redirect(`/urls/${short}`);
});

//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//

//urls_show file uses the path
app.get("/u/:shortURL", (req, res) => { //displaying new page

  if (urlDatabase[req.params.shortURL] === undefined) {
    return res.send('<p>This URL does not exist</p>');
  }

  let longURL = urlDatabase[req.params.shortURL]["longURL"];
  res.redirect(longURL);
});

//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//



app.post("/login", (req, res) => {
  //set a cookie named username to the value submitted in the request body via the login form
  if (req.cookies["userID"]) {
    return res.redirect("/urls");
  }

  const enteredEmail = req.body.emailaddress;
  const enteredPassword = req.body.password;
  let userID = checkEmailsMatch(enteredEmail, enteredPassword);

  if (!userID) {
    return res.status(400).send('Bad Request');
  }

  res.cookie("userID", userID);
  res.redirect("/urls");
});


//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//

//submit form from Tiny page
app.post("/urls/:shortURL", (req, res) => {

  const shortURL = req.params.shortURL;
  const newURL = req.body.newurl; //name is important

  urlDatabase[shortURL].longURL = newURL;
  res.redirect("/urls");
});
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//

//deleting a key-value pair from database
app.post("/urls/:shortURL/delete", (req, res) => {  //handling request

  if (!req.cookies["userID"]) {
    return res.status(401).send('Please log in');
  }
  if (Object.keys(urlsForUser(req.cookies["userID"])).includes(req.params.shortURL)) {
    const urlToDelete = req.params.shortURL;

    delete urlDatabase[urlToDelete];
    res.redirect("/urls");
  }

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
  if (req.cookies["userID"]) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user: users[req.cookies["userID"]],
  };

  res.render("register", templateVars);
});

//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-//

//post the REGISTRATION
app.post("/register", (req, res) => {

  const { email, password } = req.body;

  if (email.length === 0 || password.length === 0) {
    return res.status(400).send('Bad Request');
  }
  if (checkEmailsMatch(email, null)) {
    return res.status(400).send('Bad Request');
  } else {
    const userID = 'user' + generateRandomString();
    users[userID] = { id: userID, email, password };

    res.cookie('userID', userID);
    res.redirect("/urls");
  }
});

//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-//


app.get("/login", (req, res) => {
  if (req.cookies["userID"]) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user: users[req.cookies["userID"]],
  };

  res.render("login", templateVars);
});

//////HELPER FUNCTION/////////////


const checkEmailsMatch = (checkEmail, enteredPassword) => {
  for (let key in users) {

    let existingEmail = users[key]["email"];
    let existingPassword = users[key]["password"];

    if (existingEmail === checkEmail) {
      if (enteredPassword === null) {
        return true;
      }
      if (existingPassword === enteredPassword) {
        return key;
      }
    }
  }
};


///////////////////////////////////
///      SERVER LISTENING       ///
///////////////////////////////////

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-//


