const fs = require('fs');
const path = require('path');
const Client = require('instagram-private-api').V1;

const credentials = require('./cookies/credentials.json');

async function startBot(username, password, anchorForThisBot) {
    try {
        const device = new Client.Device(username);
        const storage = new Client.CookieFileStorage(path.join(__dirname, 'cookies', `${username}.json`));
        const session = await Client.Session.create(device, storage, username, password);
        console.log('Login to ' + username);
        
        for (let i = anchorForThisBot; i < anchorForThisBot + numberOfDMPerHour; i++) {
            try {
                if ((!(await checkIfUserIsInDMedList(followersArray[i])))) {
                    const account = await Client.Account.searchForUser(session, followersArray[i]);
                        // follow user first
                    followUser(session, account);
                    // Wait for 1 second after follow
                    await timeout(1000);
                    // then dm user
                    dmUser(session, followersArray[i], `Hey ${followersArray[i]}, hope you doing amazing! Just came across your page and really love what you are doing! We would absolutely love to give u a free trial on our service (either 50 likes or 10 new followers)🎉, in return for some feedbacks and maybe a follow? 😉\nHow do u feel about this?\nThanks a million, Zucc.`);
                    await timeout((Math.random() * 15000) + 3000);
            
                    console.log(`${username}: no.${i} message sent`);
                } else {
                    console.log("Skip this user because we already dmed him");
                    anchorForThisBot++;
                }
            } catch(err) {
                console.error(err);
            }
        }

        await save(db, `done sending for ${username}`);
        return new Promise(resolve => resolve(db.dmedTarget.length));
    } catch(err) {
        console.error(err);
    }
}

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
        const anchorOne = await startBot(zuccermann.username, zuccermann.password, anchorI);
        const anchorTwo = await startBot(zuccermann2.username, zuccermann2.password, anchorI);
        const anchorThree = await startBot(zuccermann3.username, zuccermann3.password, anchorTwo);
        const anchorFour = await startBot(zuccermann24.username, zuccermann24.password, anchorThree);
        const anchorFive = await startBot(zuccermann25.username, zuccermann25.password, anchorFour);
        
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

getTargetList(_18aboveclub.username, _18aboveclub.password, 'ecomwolf');