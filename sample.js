 // Get Account Followers
var feed = new Client.Feed.AccountFollowers(session, accountId);
const allResults = await feed.all(); // .all returns promise


Client.Session.create(device, storage, username, password)
.then((session) => {
  return [session, Client.Account.searchForUser(session, 'instagram')]; // natgeo this time :)
})
.spread((session, account) => {
  console.log(account);
  // return Client.Relationship.create(session, account.id);
})
//   .then((relationship) => {
//     console.log(relationship.params);
//    });

// Client.Session.create(device, storage, 'someuser', 'somepassword')
// 	.then(function(session) {
//    		// Now you have a session, we can follow / unfollow, anything...
// 		// And we want to follow Instagram official profile
// 		return [session, Client.Account.searchForUser(session, 'instagram')]   
// 	})
// 	.spread(function(session, account) {
// 		return Client.Relationship.create(session, account.id);
// 	})
// 	.then(function(relationship) {
// 		console.log(relationship.params)
// 		// {followedBy: ... , following: ... }
// 		// Yey, you just followed @instagram
// 	})

// Send DM to new followers
const feedF = new Ins.Feed.AccountFollowers(session, ACCOUNTIDHERE); 
const friends = await feedF.all();
const friendIds = friends.map(x => x.id);
for (let y = 0; y < friendIds.length; y++) {
    const isSent = Friends.findOne({friendId: friendIds[y]});
    if (!isSent) {
      Ins.Thread.configureText(session, friendIds[y], `Your message Here!`);
      const fObject = {
        friendId: friendIds[y],
        message: 'Sent'
      };
     Friends.insert(fObject);
     await sleep(rand+y+200+10000);
     console.log('Sent');
   };
};

// Send DMs
Client.Session.create(device, storage, 'user', 'password')
  .then((session) => { 
    return [session, Client.Account.searchForUser(session, `other`)];
  })
  .spread((session, account) => {
        return Client.Thread.configureText(session, account.id, `hey there`);
  });

// Get customer email 
console.log(user._params.publicEmail);
const user = await Client.Account.getById(session, account._params.id)	


// Client.Session.create(device, storage, username, password)
//   .then((session) => {
//     return [session, Client.Account.searchForUser(session, 'instagram')]; // natgeo this time :)
//   })
//   .spread((session, account) => {
//     // Get Account Followers
//     // var feed = new Client.Feed.AccountFollowers(session, accountId);
//     // const allResults = await feed.all(); // .all returns promise

//     var feed = new Client.Feed.AccountFollowing(session, account._params.id);
//     const allResults = feed.all(); // .all returns promise
//     return allResults;
//     // return Client.Relationship.create(session, account.id);
//   })
//   .then((allResults) => {
//     console.log(allResults.length);
//   });
  

// Client.Session.create(device, storage, username, password)
// .then((session) => {
//     return [session, Client.Account.searchForUser(session, 'instagram')]; // natgeo this time :)
// })
// .spread((session, account) => {
//     //console.log(account);
//     var feed = new Client.Feed.AccountFollowing(session, account._params.id, 100);
//     const allResults = feed.all(); // .all returns promise
//     return allResults;
// }).then((results) => {
//     console.log(results.length);
// }).catch((err) => {
//     console.error(err);
// })
