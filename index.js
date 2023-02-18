const http = require('http');
const cors = require('cors');
const nodemailer = require("nodemailer");
const readline = require("readline");
const fs = require('fs');
const Database = require("@replit/database")
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });
// {Email, Pass}
const LoginDB = new Database();
function hasDuplicates(array) {
    //step 1: loop through the array;
    for (let i = 0; i < array.length; i++) {
        //step two, for each item in the array, loop again through the other array items and check if there is a duplicate value
        for (let j = i + 1; j < array.length; j++) {
            if (array[i] === array[j]) {
                return true;
            }
        }
    }
    return false;
}
function linearSearch(array, target) {
    for (let i = 0; i < array.length; i++) {
        if (array[i] === target) {
            return true;
        }
    }
    return false;
}
//make personalized mail class 

class File {
    constructor(fileName) {
        this.fileName = fileName;
    }
    readFile(callback) {
        fs.readFile(this.fileName, 'utf8', (err, data) => {
            if (err) {
                console.log(err);
                //callback function takes an error and data paremeter
                callback(err, null);
            } else {
                callback(null, data);
            }
        });
    }
    appendToFile(data) {
        data.email = data.email.toLowerCase();
        fs.appendFile(this.fileName, JSON.stringify(data) + '&^%72451&@%\n', (err) => {
            if (err) { console.log(err) } else {
                console.log("Data written to file successfully");
            }
        })
    }
    //capstone methods 

    //category is either email or password in the context of this project and text is the pass and target being the email/username
    //example of scalable method
    //the synchrnous version of this snippet is shorter & simpler but async outweighs the cons
    overWriteUser(_target, _targetCategory, targetChangeCat, changeText) {
        return new Promise((res, rej) => {
            this.parseToObjects().then(users => {
                let targetIndex = -1;
                for (let i = 0; i < users.length; i++) {
                    if (users[i][_targetCategory] === _target) {
                        targetIndex = i;
                        break;
                    }
                }
                if (targetIndex != -1) {
                    if (changeText != users[targetIndex][targetChangeCat]) {
                        users[targetIndex][targetChangeCat] = changeText;
                    } else {
                        res(false);
                        return;
                    }

                } else {
                    //if email does not exist 
                    return;
                }
                fs.writeFile(this.fileName, '', (err) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('file cleared');
                        //perfect for typescript
                        let promises = [];
                        for (let i = 0; i < users.length; i++) {
                            promises.push(new Promise((resolve, reject) => {
                                fs.appendFile(this.fileName, JSON.stringify(users[i]) + '&^%72451&@%\n', (err) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        resolve();
                                    }
                                }
                                );
                            })
                            );
                        }
                        //first use case of the Promise.all static method

                        Promise.all(promises)
                            .then(() => {
                                console.log('file overwritten successfully');
                                res(true);
                            })
                            .catch((err) => {
                                console.log(err);

                            });
                    }
                });
            });
        })

    }

    //returns every single user in the csv file in the form of an array of objects
    async getUserDatabase() {
        try {
            const data = new Promise((resolve, reject) => {
                fs.readFile(this.fileName, (err, data) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(data.toString());
                    }
                });
            })
            return data;
        } catch (err) {
            console.log(err);
            throw err;
        }
    }
    //dangerous method, use wisely
    addParameter(key, value) {
        return new Promise((res, rej) => {
            this.parseToObjects().then(data => {
                let users = data;
                for (let i = 0; i < data.length; i++) {
                    users[i][key] = value;

                }
                fs.writeFile(this.fileName, '', (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        let promises = [];
                        for (let i = 0; i < users.length; i++) {
                            promises.push(new Promise((resolve, reject) => {
                                fs.appendFile(this.fileName, JSON.stringify(users[i]) + '&^%72451&@%\n', (err) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        resolve();
                                    }
                                });
                            }));
                        }
                        //first use case of the Promise.all static method

                        Promise.all(promises)
                            .then(() => {
                                console.log('file overwritten successfully');
                                res(true);
                            })
                            .catch((err) => {
                                console.log(err);
                                rej(err);

                            });
                    }
                })
            })
        })

    }
    parseToObjects() {
        return new Promise((resolve, reject) => {
            this.getUserDatabase().then(data => {
                let fileContents = data;
                let userArray = fileContents.split('&^%72451&@%');
                let userParsedArray = [];
                for (let i = 0; i < userArray.length - 1; i++) {
                    userParsedArray.push(JSON.parse(userArray[i]));
                }
                resolve(userParsedArray);

            })
        })

    }
    getUser(email) {
        return new Promise((resolve, reject) => {
            this.parseToObjects().then(users => {
                for(let i = 0; i < users.length; i++) {
                    if(email === users[i].email) {
                        resolve(users[i]);
                    }
                }
                resolve(null);
            }).catch(err => reject(err));
        })
 
    }
    //alphabetical merge sort && binary search for upgrade
    checkForMatchingUserInDB(user) {
        let incomingUser = JSON.parse(user);
        return new Promise((resolve, reject) => {
            this.parseToObjects().then(data => {
                console.log(incomingUser.email);
                let foundMatch = false;
                let foundMatchIndex = -1;
                for (let i = 0; i < data.length; i++) {
                    if (data[i].email === incomingUser.email && data[i].password === incomingUser.password) {
                        foundMatch = true;
                        foundMatchIndex = i;
                    }
                }
                if (!foundMatch) {
                    resolve({ matchStatus: false });
                } else {
                    resolve({ matchStatus: true, username: data[foundMatchIndex].username });
                }
            }).catch(err => console.log(err));
        })
    }
    //checks in user database if someone has the same email, integrate with addUser() to check
    checkForDuplicatesInCategory(_user, targetCategory, target) {
        let user = _user;
        return new Promise((resolve, reject) => {
            this.parseToObjects().then(data => {
                let userCategory = [];
                for (let i = 0; i < data.length; i++) {
                    userCategory.push(data[i][targetCategory]);
                }
                userCategory.push(user[targetCategory]);
                if (!hasDuplicates(userCategory)) {
                    userCategory.pop();
                    console.log(userCategory);
                    resolve(true);
                } else {
                    userCategory.pop();
                    resolve(false);
                }
            }).catch(err => { console.log(err); reject(false) });
        })
    }
    searchInCategory(_user, targetCategory, target) {
        let user = _user;
        return new Promise((resolve, reject) => {
            this.parseToObjects().then(data => {
                let userCategory = [];
                for (let i = 0; i < data.length; i++) {
                    userCategory.push(data[i][targetCategory]);
                }
                userCategory.push(user[targetCategory]);
                if (!linearSearch(userCategory, target)) {
                    userCategory.pop();
                    console.log(userCategory);
                    resolve(true);
                } else {
                    userCategory.pop();
                    resolve(false);
                }
            }).catch(err => { console.log(err)});
        })
    }
    checkForUserDuplicatesInDB(_user) {
        return new Promise((resolve, reject) => {
            this.checkForDuplicatesInCategory(_user, "email").then(data => {
                resolve(data);
            }).catch(err => reject(err));
        })
    }
    //add user login data to database
    addUser(_user) {
        let user = _user;
        return new Promise((resolve, reject) => {
            this.checkForUserDuplicatesInDB(user).then(data => {
                if (data) {
                    this.appendToFile(user);
                    resolve(true);
                } else {
                    resolve(false);
                }
            }).catch(err => { console.log(err); reject(false) })
        })
        /*
        return new Promise((resolve, reject) => {
            this.parseToObjects().then((data) => {
                let userEmails =[];
                for(let i = 0; i < data.length; i++) {
                    userEmails.push(data[i].email);
                }
                userEmails.push(user.email);
                if(!hasDuplicates(userEmails)) {
                    console.log(userEmails);
                    this.appendToFile(user);
                    resolve(true);
                } else {
                    reject(false);
                }
            }).catch(err => console.log(err));
        });
        */
    }
}
const db = new File('database.csv');

db.addParameter("on_mailing_list", false);
db.parseToObjects().then(data => console.log(data));
// overWrite user password

const senderAuth = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'noob2918392@gmail.com',
        pass: 'pgrzofepgipqyxqj',
    }
}
function generateRandomNumber() {
    const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    // Shuffle the array using the Fisher-Yates shuffle algorithm
    for (let i = numbers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    // Concatenate the first 6 elements of the shuffled array to create a 6-digit number
    return numbers.slice(0, 6).join('');
}
class Mailer {
    constructor(recipient, _senderAuth) {
        this.recipient = recipient;
        this.senderAuth = _senderAuth;
        this.transporter = nodemailer.createTransport(this.senderAuth);
        this.verificationCode = generateRandomNumber();
        this.isValid = true;
    }
    createMessageInstance(from, to, subject, text, html) {
        class Message {
            constructor(from, to, subject, text, html) {
                this.from = from;
                this.to = to;
                this.subject = subject;
                this.text = text;
                this.html = html;
            }
        }
        return new Message(from, to, subject, text, html);
    }
    sendMail(message, req, res) {
        const messageFinal = this.createMessageInstance(
            this.senderAuth.auth.user,
            this.recipient,
            message.subject,
            message.content,
            "<h1>" + message.content + "</h1>"
        );
        this.transporter.sendMail(messageFinal, (error, info) => {
            if (error) {
                console.log(error);
                this.isValid = false;
                res.write(JSON.stringify({ email: false, verificationCode: false }));
                res.end();
            } else {
                console.log(`Email sent ${info.response}`);
                this.isValid = true;
                res.write(JSON.stringify({ email: this.recipient, verificationCode: this.verificationCode }));
                res.end();
            }
        });
    }
    //mutator method
    generateNewCode() {
        this.verificationCode = generateRandomNumber();
    }
}

//follow this format when api-requesting, then build the frontend in react.
let testMail = new Mailer('email@example.com', senderAuth)

//may have to use cors to only include whitelisted urls
http.createServer(function(req, res) {
    cors()(req, res, () => {
        if (req.url === '/') {
            if (req.method === 'GET') {
                res.write(JSON.stringify("F"));
                res.end();
            } else if (req.method === 'POST') {

            } else {
                res.statusCode = 405;
                res.end();
            }
        } else if (req.url === '/verificationCode/send') {
            if (req.method === 'POST') {
                console.log("request started");
                let recipientEmail = '';
                req.on('data', function(buffer) {
                    recipientEmail += buffer.toString();
                });
                req.on('end', () => {
                    recipientEmail = JSON.parse(recipientEmail);
                    let verificationMailer = new Mailer(recipientEmail, senderAuth);

                    verificationMailer.sendMail({ subject: "Verification Code", content: "Verification Code: " + verificationMailer.verificationCode }, req, res);

                })
            } else if (req.method === 'GET') {
                console.log("get request");
            }
        } else if (req.url === '/LoginDB') {
            //store or retrieve login information in sql database
            if (req.method === 'POST') {
                console.log("db request started");
                let incomingVerifiedUser = '';
                req.on('data', (buffer) => {
                    incomingVerifiedUser += buffer.toString();
                })
                req.on('end', () => {
                    incomingVerifiedUser = JSON.parse(incomingVerifiedUser);
                    let newUser = {
                        email: incomingVerifiedUser.email,
                        password: incomingVerifiedUser.password,
                        username: incomingVerifiedUser.email.split("@")[0],
                        email_domain: incomingVerifiedUser.email.split("@")[1],
                        on_mailing_list: false,
                    }
                    db.addUser(newUser).then(successful => {
                        console.log(successful)
                        res.write(JSON.stringify({ emailStored: successful }));
                        res.end();
                    }).catch(err => console.log(err));
                })
            } else if (req.method === 'GET') {

            }
        } else if (req.url === '/checkForDuplicatesInDB') {
            //check for duplicate emails only, used for the create account process
            if (req.method === 'POST') {
                console.log('duplicate checker started');
                let incomingEmail = '';
                req.on('data', (buffer) => {
                    incomingEmail += buffer.toString();
                })
                req.on('end', () => {
                    incomingEmail = JSON.parse(incomingEmail);
                    db.checkForUserDuplicatesInDB({ email: incomingEmail.toLowerCase() }).then(data => {
                        console.log('duplicate request end');
                        res.write(JSON.stringify({ emailNotStored: data }));
                        res.end();
                    }).catch(err => console.log(err));
                })
            }
        } else if (req.url === '/checkForSignIn') {
            //very similar to 'checkForDuplicates' but for passwords too, used for the sign in process
            if (req.method === 'POST') {
                let incomingUser = '';
                req.on('data', (buffer) => {
                    incomingUser += buffer.toString();
                })
                req.on('end', () => {
                    db.checkForMatchingUserInDB(incomingUser).then(foundMatch => {
                        res.write(JSON.stringify(foundMatch));
                        res.end();
                    });

                })
            }
        } else if (req.url === '/amountOfUsers') {
            if (req.method === 'GET') {
                db.parseToObjects().then(users => {
                    res.write(JSON.stringify({ AmountOfUsers: users.length }));
                    res.end();
                })
            }
        } else if (req.url === '/changePassword') {
            if (req.method === 'POST') {
                //will use new password parameter instead of password
                console.log('change password request started')
                let incomingUser = '';
                req.on('data', (buffer) => {
                    incomingUser += buffer.toString();
                })
                req.on('end', () => {
                    incomingUser = JSON.parse(incomingUser);
                    db.overWriteUser(incomingUser.email, 'email', 'password', incomingUser.new_password).then(status => {
                        console.log(status);
                        res.write(JSON.stringify(status));
                        res.end();
                    });
                })
            }
        } else if (req.url === '/updateUsername') {
            if (req.method === 'POST') {
                console.log('username change requested');
                let incomingChange = '';
                req.on('data', (buffer) => {
                    incomingChange += buffer.toString();
                })
                req.on('end', () => {
                    incomingChange = JSON.parse(incomingChange);
                    db.searchInCategory("bull", "username", incomingChange.username.replace(/\s/g, '').toLowerCase()).then(data => {
                        if (data) {
                            console.log(incomingChange.username.replace(/\s/g, '').length);
                            if(incomingChange.username.replace(/\s/g, '').length >= 4 || incomingChange.username.replace(/\s/g, '').length <= 30) {
                            db.overWriteUser(incomingChange.email, 'email', 'username', incomingChange.username.replace(/\s/g, '').toLowerCase()).then(status => {
                                res.write(JSON.stringify(status));
                                res.end();
                            });
                            console.log(incomingChange.email);
                            } else {
                                res.write(JSON.stringify(false));
                                res.end();
                            }
                        } else {
                            res.write(JSON.stringify(false));
                            res.end();
                        }
                    })
                    //new function


                })

            }
        } else if (req.url === '/updateMailingList') {
            console.log('mailing list change requested');
                        if (req.method === 'POST') {
                let incomingChange = '';
                req.on('data', (buffer) => {
                    incomingChange += buffer.toString();
                })
                req.on('end', () => {
                    incomingChange = JSON.parse(incomingChange);
                    console.log(incomingChange.type);
                    if(incomingChange.type === 'post') {
                    db.overWriteUser(incomingChange.email, 'email', 'on_mailing_list', incomingChange.onMailingList).then(status => {
                        res.write(JSON.stringify(status));
                        res.end();
                    });
                    } else if (incomingChange.type === 'get') {
                        db.getUser(incomingChange.email).then(user => {
                            if(user !== null) {
                                res.write(JSON.stringify(user.on_mailing_list));
                                res.end();
                            } 
                        })
                    }
                })

            }
        }
    })

}).listen(3000);
console.log("listening on port 3000");
