const bcrypt = require('bcrypt');

const plainPassword = "password123";
const saltRounds = 12; // higher than 10 is stronger
bcrypt.hash(plainPassword, saltRounds, (err, hash) => {
    if (err) throw err;
    console.log(hash); // <-- copy this hash into your SQL
});