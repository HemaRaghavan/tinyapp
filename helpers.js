const checkEmail = function(users, email) {
  for (user in users) {
    if (users[user].email === email) {
      return true;
    } 
  }
  return false;
}

module.exports = { checkEmail }
