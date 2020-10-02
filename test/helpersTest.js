const { assert } = require('chai');

const { getUserByEmail, urlsForUser } = require('../helpers.js');

const testUsers = {
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

const testUrlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "8rvcfl"},
  "9sm5xK": {longURL: "http://www.google.com", userID: "5xn69m"}
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.strictEqual(user,expectedOutput);
  });
  it('should return false with invalid email', function() {
    const user = getUserByEmail("abc@example.com", testUsers);
    const expectedOutput = false;
    assert.strictEqual(user,expectedOutput);
  });
});

describe('urlsForUser', function() {
  it('should return an object corresponding to user', function() {
    const user = urlsForUser("8rvcfl", testUrlDatabase);
    const expectedOutput = {"b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "8rvcfl"}};
    assert.deepEqual(user,expectedOutput);
  });
  it('should return empty object for id with no URL matching', function() {
    const user = urlsForUser("8rvcfo", testUrlDatabase);
    const expectedOutput = {};
    assert.deepEqual(user,expectedOutput);
  });
});