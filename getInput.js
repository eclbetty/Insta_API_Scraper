const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function getInput(q) {
    return new Promise((resolve, reject) => {
        rl.question(q, (input) => {
            resolve(input);

            rl.close();
        })
    })
}

module.exports =  getInput;