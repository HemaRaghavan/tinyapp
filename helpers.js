// checks the database for the given email id and returns the id of the user
const getUserByEmail = function(email, users) {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user].id;
    }
  }
  return false;
};

//returns the urls associated with the given id
const urlsForUser = function(id,db) {
  let result = {};
  for (let element in db) {
    if (db[element].userID === id) {
      result[element] = db[element];

    }
  }
  return result;
};



module.exports = { getUserByEmail,urlsForUser };
