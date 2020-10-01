const checkEmail = function(users, email) {
  for (user in users) {
    if (users[user].email === email) {
      return users[user];
    } 
  }
  return false;
}

module.exports = { checkEmail }
