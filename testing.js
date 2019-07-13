function getUser(id) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log('Reading a user from a database');
            resolve({id: id, githubUsername: 'jordan'});
        }, 5000);
    })
}

function Promise(func) {
    
}

const promise = new Promise

(async () => {
    await getUser(10);
})();