// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// The current database to use.
use("mydb");

// Find a document in a collection.
db.getCollection("users").insertOne({
    "fullName": "Tanay Mukhopadhyay",
    "email": "tmtanay56@gmail.com",
    "password": "test1234",
    "phoneNo": "9681253017",
    "address": "test test",
    "isAdmin": true,
    "access": true,
    "role": 1
});
