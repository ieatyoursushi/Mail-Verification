const http = require('http');
const cors = require('cors');
const nodemailer = require("nodemailer");
const readline = require("readline");
const fs = require('fs');
const Database = require("@replit/database")
// {Email, Pass}
const LoginDB = new Database();
//make personalized mail class 
class File {
    constructor(fileName) {
        this.fileName = fileName;
    }
    readFile(callback) {
        fs.readFile(this.fileName, (err, data) => {
            if (err) {
                console.log(err);
                callback(err);
            } else {
                callback(data.toString());
            }
        });
    }
    appendToFile(data, callback) {
        fs.appendFile(this.fileName, JSON.stringify(data) + ',\n', (err) => {
            if (err) { console.log(err) } else {
                console.log("Data written to file successfully");
                callback(data);
            }
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
    //add user login data to database
    addUser(email, pass) {
        let user = {
            email: email,
            password: pass
        }
        return new Promise((resolve, reject) => {
            this.appendToFile(user, (data) => {
                try {
                    this.appendToFile(user, (data) => {
                        resolve(data);
                    })
                } catch (err) {
                    console.log(err);
                    resolve(err);
                }
            })
        })
    }
}
const db = new File('database.csv');
db.getUserDatabase().then(data => console.log(data));

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

            } else if (req.method === 'GET') {

            }
        }
    })

}).listen(3000);
console.log("listening on port 3000");
