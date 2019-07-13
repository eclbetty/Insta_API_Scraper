const fs = require('fs');
const path = require('path');
const LanguageDetect = require('languagedetect');
const lngDetector = new LanguageDetect();
const db = require('./cookies/db.json');
// const email_list = require('./email_list.json');
const credentials = require('./cookies/credentials.json');
const Client = require('instagram-private-api').V1;
var cursor; 

(async function() {
    // Setup account here
    try {
        const credential = credentials['18aboveclub'];
        const username = credential.username;
        const password = credential.password;

        const device = new Client.Device(username);
        const storage = new Client.CookieFileStorage(path.join(__dirname, 'cookies', `${username}.json`));
        const session = await Client.Session.create(device, storage, username, password);
        console.log(`Login as ${username}`);

        let feed = new Client.Feed.TaggedMedia(session, "blackownedbusiness");
        let results = await feed.get();
        results.map(async (result) => {     

            try {
                const account = await Client.Account.getById(session, result._params.user.pk);
            } catch (err) {
                console.error(err);
            }
            const params = account._params;

            const list = {
                name: params.fullName,
                bio: params.biography,
                email: params.publicEmail,
                followerCount: params.followerCount,
                isPotentialBiz: params.isPotentialBusiness,
                isBiz: params.isBusiness,
                category: params.category
            }
            
            console.log(list);
            // console.log(lngDetector.detect(result._params.caption, 1));
            
        });
    } catch(err) {
        console.error(err);
    }


})()

async function getTargetList(username, password, targetMine) {
    const device = new Client.Device(username);
    const storage = new Client.CookieFileStorage(path.join(__dirname, 'cookies', `${username}.json`));
    const session = await Client.Session.create(device, storage, username, password);
    console.log('Login to ' + username);
    const account = await Client.Account.searchForUser(session, targetMine);
    
    searchForTargetsEmail(session, account._params.id, 1000);
    // searchForTargets(session, account._params.id, 10000);
}

function checkIfUserIsInTargetList(username) {
    return new Promise(resolve => resolve(db.newTarget.includes(username)));
}

function checkIfUserIsInDMedList(username) {
    return new Promise(resolve => resolve(db.dmedTarget.includes(username)));
}

async function followUser(session, account) { 
    const relationship = await Client.Relationship.create(session, account._params.id);
}

async function dmUser(session, username, text) {
    // Send DMs
    try {
        const account = await Client.Account.searchForUser(session, username);
        if (!db.dmedTarget.includes(username)) {
            const dm = await Client.Thread.configureText(session, account.id, text);
            db.dmedTarget.push(username);
        }
    } catch(err) {
        console.error(err);
    }
}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function searchForTargetsEmail(session, accountId, limit) {
    console.log('inside of searchForTargetsEmail');
    const feed = await new Client.Feed.AccountFollowers(session, accountId, limit || 7500);

    if (cursor) {
        feed.setCursor(cursor);
        console.log("There is a cursor", cursor);
    }
    let allResults = await feed.all();
    if (feed.isMoreAvailable()) {
        cursor = feed.getCursor();
        console.log("There is more available", cursor);
    }

    console.log(allResults);

    for (var i = 0; i < allResults.length; i++) {
        if (allResults[i]._params.publicEmail) {
            const emailListObj = {
                name: allResults[i]._params.fullName,
                email: allResults[i]._params.publicEmail,
                followerCount: allResults[i]._params.followerCount
            }
            followersArray.push(emailListObj);
        }
    }  

    await timeout(1 * 30 * 1000);

    // Write to file 
    console.log(followersArray.length);
    db.cursor = cursor;
    email_list.list = followersArray;

    fs.writeFile('./email_list.json', JSON.stringify(email_list, null, 4), 'utf8', function(err) {
        if (err) throw err;
        return new Promise(resolve => resolve( console.log(doneMessage)));
    });
}

async function searchForTargets(session, accountId, limit) {
    console.log('inside of searchForTarget');
    const feed = await new Client.Feed.AccountFollowers(session, accountId, limit || 7500);

    if (cursor) {
        feed.setCursor(cursor);
        console.log("There is a cursor", cursor);
    }
    let allResults = await feed.all();
    if (feed.isMoreAvailable()) {
        cursor = feed.getCursor();
        console.log("There is more available", cursor);
    }

    console.log(allResults);

    for (var i = 0; i < allResults.length; i++) {
        followersArray.push(allResults[i]._params.username);
    }  

    await timeout(1 * 30 * 1000);

    // Write to file 
    console.log(followersArray.length);
    db.cursor = cursor;
    db.newTarget = followersArray;
}

function save(db, doneMessage) {
    fs.writeFile('./cookies/db.json', JSON.stringify(db, null, 4), 'utf8', function(err) {
        if (err) throw err;
        return new Promise(resolve => resolve( console.log(doneMessage)));
    });
}

async function runAllBots() {
    try {
        const anchorOne = await startBot(_18aboveclub.username, _18aboveclub.password);
        
        anchorI = anchorFive;
        await save(db, 'done sending all message');
    } catch (err) {
        console.error(err);
    }
}

// runAllBots();
// setInterval(async function() {
//     runAllBots();
// }, oneHour);

// getTargetList(_18aboveclub.username, _18aboveclub.password, 'ecomwolf');