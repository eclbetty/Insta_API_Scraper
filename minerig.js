const fs = require('fs');
const path = require('path');
const getInput = require('./getInput');
// instaprivateapi
const credentials = require('./cookies/credentials.json');
const Client = require('instagram-private-api').V1;
// db
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('db.json');
const credentialAdapter = new FileSync('./cookies/credentials.json');
const db = low(adapter);
const credentialDb = low(credentialAdapter);

let cursor; 
let session;
let results;
let targetAccount; 
let myAccounts = ['18aboveclub', 'instant_roi', 'instantroigram', 'powerupgram', 'double_growth', 'datcjordan'];

const user = 'instant_roi';
const account = credentialDb.get(user).value();

(async function main() {    

    const device = new Client.Device(account.username);
    const storage = new Client.CookieFileStorage(path.join(__dirname, 'cookies', `${account.username}.json`));

    // login(account.username, account.password, account.proxy ? account.proxy : "");
    try {

        if (account.proxy) {
            console.log(account.proxy);
            session = await Client.Session.create(device, storage, account.username, account.password, `http://${account.proxy}`);
        } else {
            session = await Client.Session.create(device, storage, account.username, account.password);
        }

        console.log(`Login as ${account.username}`);
        
    } catch (err) { 
  
        console.error(`Error creating session: ${err}`);

        if (err.name == "CheckpointError") {
            console.log('challenge error');

            return challengeMe(err);
        }
    } 

    // get media and their user ID
    // getMediaFromHashtag(session, 'blackownedbusiness', 20);

    // Get email
    //iterateAndGetEmail(70);
})();

function getSession(account) {
    let session;

    if (account.hasOwnProperty('isLogin')) {
        if (checkIsLoginExpired(account.isLogin)) {
            console.log("New login: last login expired")
            session = login(account.username, account.password);
            return session;
        } else {
            console.log("Old login");
            const device = new Client.Device(account.username);
            const storage = new Client.CookieFileStorage(path.join(__dirname, 'cookies', `${account.username}.json`));
            session = new Client.Session(device, storage);
            return session;
        }
    } else {
        console.log("New login: did not login before")
        session = login(account.username, account.password);
        return session;
    }
}

function checkIsLoginExpired(lastLoginTimestamp) {

    if (lastLoginTimestamp) {
        var difference = Date.now() - lastLoginTimestamp;
        var daysDifference = Math.floor(difference/1000/60/60/24);
    
        if (daysDifference >= 7) {
            return true;
        } else {
            return false;
        }
    } else {
        return true;
    }
}

async function login(username, password, proxy) {
    const device = new Client.Device(username);
    const storage = new Client.CookieFileStorage(path.join(__dirname, 'cookies', `${username}.json`));
    try {

        if (proxy) {
            console.log(proxy);
            session = await Client.Session.create(device, storage, username, password, `http://${proxy}`);
        } else {
            session = await Client.Session.create(device, storage, username, password);
        }

        return session;
    } catch (err) {
        console.error(`Error creating session: ${err}`);

        if (err.name == "CheckpointError") {
            console.log('challenge error');

            return challengeMe(err);
        }
    }

}

async function getMediaFromHashtag(session, searchTerm, limit) {
    let feed = new Client.Feed.TaggedMedia(session, searchTerm, limit || 2000);
    
    if (cursor) {
        feed.setCursor(cursor);
        console.log("There is a cursor", cursor);
    }

    try {
        results = await feed.all();
    } catch (err) {
        console.error(`Error fetching feed: ${err}`);
    }

    if (feed.isMoreAvailable()) {
        cursor = feed.getCursor();
        db.set('cursor', cursor)
            .write();
        console.log("There is more available", cursor);
    }

    results.map(async (result) => {
        try {
            console.log(result);

            // Find user from db
            const user = db.get('users')
                            .find({ id: result._params.user.pk })
                            .value();

            // If there is no user, add it to db
            if (!user) {
                db.get('users')
                .push({ 
                    id: result._params.user.pk,
                    username: result._params.user.username,
                    takenAt: result._params.takenAt
                })
                .write();

                // Count how many username we got from result
                db.update('count', n => n + 1)
                    .write();
            }
            // targetAccount = await Client.Account.getById(session, result._params.user.pk);
        } catch (err) {
            console.log(`Error getting account: ${err}`);
        }
    });
}

function iterateAndGetEmail(getEmailLimit) {
    let counter = 0;
    let users = db.get('users').value();

    for (let i = 0; i < users.length; i++) {
        console.log(i);

        if (counter >= getEmailLimit) {
            break;
        }

        let user = users[i];
        if (user.hasOwnProperty('emailAddress')) {
            continue;
        } else {
            addEmailToUser(session, user.id);
            counter++;
        }
    }
}

function checkAllAccStatus() {
    for (i in myAccounts) {
        const account = credentialDb.get(myAccounts[i]).value();
        session = getSession(account.username, account.password);
        if (account.proxy) {
            console.log(account.proxy);
            session.setProxy('http://' + account.proxy);
        }

        checkIfAccIsWarm();
    }
}

function checkIfAccIsWarm() {
    let counter = 0;
    let users = db.get('users').value();

    for (let i = 0; i < users.length; i++) {
        console.log(i);

        if (counter >= 1) {
            break;
        }

        let user = users[i];
        if (user.hasOwnProperty('emailAddress')) {
            continue;
        } else {
            warmAccount(session, user.id);
            counter++;
        }
    }
}

async function warmAccount(session, userID) {
    try {
        let targetAccount = await Client.Account.getById(session, userID);
        const params = targetAccount._params;

        const isBiz = params.hasOwnProperty('isBusiness');
        const publicEmail = params.hasOwnProperty('publicEmail');

        let username = targetAccount['_session']['_device']['username'];

        if (isBiz && publicEmail) {
            console.log(`${username} is warm: Can retrieve email ady`);
        } else {
            console.log(`${username} is cold: Can't retrieve email yet`);
        }
    } catch (err) {
        console.error(err);
    }
}

async function addEmailToUser(session, userID) {
    try {
        let targetAccount = await Client.Account.getById(session, userID);
        const params = targetAccount._params;

        // console.log(targetAccount)

        if (params.publicEmail) {
            // set hasEmail = false;
            db.get('users')
                .find({ id: userID })
                .assign({
                    "emailAddress": params.publicEmail,
                    "name": params.fullName,
                    "followerCount": params.followerCount,
                    "followingCount": params.followingCount,
                    "isBiz": params.isBusiness,
                    "category": params.category,
                    "bio": params.biography
                })
                .write();
        } else {
            // set hasEmail = true;
            db.get('users')
                .find({ id: userID })
                .assign({
                    "emailAddress": null,
                    "name": params.fullName,
                    "followerCount": params.followerCount,
                    "followingCount": params.followingCount,
                    "isBiz": params.isBusiness,
                    "category": params.category,
                    "bio": params.biography
                })
                .write();
        }
    } catch (err) {
        console.error('Error getting targetAccount by ID: ', err);
    }
}

function challengeMe(error){
	return Client.Web.Challenge.resolve(error,'phone')
		.then(function(challenge){
			// challenge instanceof Client.Web.Challenge
			console.log(challenge.type);
			// can be phone or email
			// let's assume we got phone
			if(challenge.type !== 'phone') return;
            //Let's check if we need to submit/change our phone number
            const phoneNumber = getInput('phone number: ');
			return challenge.phone(phoneNumber)
				.then(function(){return challenge});
		})
		.then(function(challenge){
            // Ok we got to the next step, the response code expected by Instagram
            const code = getInput('code: ');
			return challenge.code(code);
		})
		.then(function(challenge){
			// And we got the account confirmed!
			// so let's login again
			// return loginAndFollow(device, storage, user, password);
        })
        .catch(function(err) {
            
            console.error(err);
        })
}
