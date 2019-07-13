const path = require('path');
// db
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('db.json');
const emailListAdapter = new FileSync('emailist.json');
const db = low(adapter);
const emailDb = low(emailListAdapter);

const users = db.get('users')
    .value();


const userWithEmail = users.filter((user) => {
    if (user.emailAddress) {
        return true;
    }
})

// console.log(userWithEmail);
emailDb.set('emails', userWithEmail)
    .write();
// console.log(users);