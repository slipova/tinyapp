const { users } = require("./express_server");

// GET USER BY EMAIL
const getUserByEmail = function(email, database) {
  for (let user in database) {
    if (database[user]["email"] === email) {
      return database[user];
    }
  }
};



module.exports = { getUserByEmail };