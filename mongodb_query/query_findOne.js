// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// The current database to use.
use("mydb");

// Find a document in a collection.
db.getCollection("users").findOne({
    userEmail: "tmtanay56@gmail.com"
});
