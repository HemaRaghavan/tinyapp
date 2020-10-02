const getUserByEmail = function(email, users) {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user].id;
    }
  }
  return false;
};
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
