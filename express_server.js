//making it possible to make HTTP requests on port 8080

const express = require("express");
const app = express();
const PORT = 8080;

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const e = require("express");
const bcrypt = require("bcryptjs");
const cookieSession = require("cookie-session");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cookieSession({
  name: "session",
  keys: ["key1", "key2"]
}));


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
    password: "$2a$10$Lq0f5Ba2MquQv/zRQ2yijeNDrIYpvVIW7gL1.KydJZLN6q4CdXn3q"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "$2a$10$en8fRldKkuPpMtBtlEciUesHjUPlsH3FdbJR4fpzr5zIQ4s2JAz/i"
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
  const userID = req.session["userID"];
  if (userID) {
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
  console.log("users", users)

  const userID = req.session["userID"];
  const user = users[`${userID}`];
  console.log("user: ", user);
  // console.log("session userid", session_userID)
  // store variables in an object to be able to refer to them in the file - urls_index in this case
  if (!user) {
    return res.status(400).send("You are not logged in");
  }

  const urlUser = urlsForUser(userID);
  const templateVars = { urls: urlUser, user };
  res.render("urls_index", templateVars);

});
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//

//place before  app.get("/urls/:id", ...) ORDER MATTERS       ///USER_ID
app.get("/urls/new", (req, res) => {
  const userID = req.session["userID"];
  if (userID === null) {
    return res.redirect("/login");
  }
  const templateVars = {
    user: users[userID],
  };
  res.render("urls_new", templateVars);

});
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//

//new URL
app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session["userID"]

  if (userID === null) {
    return res.status(401).send('Please log in');
  }
  // create an array of shortURLS associated with the user and see if the link is in there
  if (Object.keys(urlsForUser(userID)).includes(req.params.shortURL)) {
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      user: users[`${userID}`]
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
  const userID = req.session["userID"]
  urlDatabase[short] = { longURL: long, userID };
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

  const enteredEmail = req.body.emailaddress;
  const enteredPassword = req.body.password;
  let userID = checkEmailsMatch(enteredEmail, enteredPassword);
  console.log("userID: ", userID)

  if (!userID) {
    return res.status(400).send('Bad Request');
  }

  req.session["userID"] = userID;
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
  const userID = req.session["userID"]
  if (userID === null) {
    return res.status(401).send('Please log in');
  }
  if (Object.keys(urlsForUser(userID)).includes(req.params.shortURL)) {
    const urlToDelete = req.params.shortURL;

    delete urlDatabase[urlToDelete];
    res.redirect("/urls");
  }

});
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-//

//logout clear cookies?
app.post("/logout", (req, res) => {  //handling request
  req.session["userID"] = null;

  res.redirect("/urls");
});

//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-//


//=-=-=-=-=-////////////-=-=-=-=-//
//          REGISTRATION         //
//=-=-=-=-=-////////////-=-=-=-=-//

//render registration page
app.get("/register", (req, res) => {
  const userID = req.session["userID"]
  if (userID) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user: users[userID],
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
    const hashedPassword = bcrypt.hashSync(password, 10);
    users[userID] = { id: userID, email, password: hashedPassword };
    console.log(users[userID])

    req.session["userID"] = userID;

    res.redirect("/urls");
  }
});

//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-//


app.get("/login", (req, res) => {
  const userID = req.session["userID"]
  if (userID) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user: users[userID]
  };

  res.render("login", templateVars);
});

//////HELPER FUNCTION/////////////


const checkEmailsMatch = (enteredEmail, enteredPassword) => {
  for (let key in users) {

    let existingEmail = users[key]["email"];
    let hashedPassword = users[key]["password"];

    if (existingEmail === enteredEmail) {
      if (enteredPassword === null) {
        return true;
      }
      if (bcrypt.compareSync(enteredPassword, hashedPassword)) {
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
