require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const { political } = require("./political.js");
const { disallowed } = require("./disallowed.js");
const { ethnocentric } = require("./ethnocentric.js");
const Sentiment = require("sentiment");
const sentiment = new Sentiment();
const Log = require("./logging/Log.js");

const PORT = process.env.PORT || 5000;
const mongoURI = process.env.MONGO_URI;

const connectOptions = {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true,
};
mongoose.Promise = global.Promise;
mongoose.connect(mongoURI, connectOptions, (err, db) => {
    if (err) console.log(`Error: ${err}`);
    console.log("Connected to MongoDB");
});

const server = express();
server.use("/disallowed", express.static(path.join(__dirname + "/disallowed")));
server.use(
    "/ethnocentric",
    express.static(path.join(__dirname + "/ethnocentric"))
);
server.use("/is", express.static(path.join(__dirname + "/is")));
server.use("/political", express.static(path.join(__dirname + "/political")));

server.use("/robots.txt", (req, res) => {
    res.type("text/plain");
    res.send("User-agent: *\nDisallow: /");
});

server.get("/", (req, res) => {
    res.setHeader("Set-Cookie", "HttpOnly;Secure;SameSite=Strict");
    const rootSubdomain = req.subdomains[0];
    const subject = req.subdomains[1];
    const subdomain = subject + "." + rootSubdomain;
    const { ip, ips } = req;
    const analyzedSentiment = sentiment.analyze(subject, disallowed);
    const query = Log.where({  rootSubdomain, subject, subdomain, ip, ips  });
    query.findOne((err, log) => {
        if (err) console.log(err);
        if (log === null) {
            const newLog = new Log({rootSubdomain, subject, subdomain, ip, ips});
            newLog.save(err => {
                if (err) console.log(err);
            });
        }
    });
    if (!subject) {
        return res.sendFile(path.join(__dirname + "/index.html"));
    } else if (political.some((politics) => subject.includes(politics))) {
        return res.sendFile(path.join(__dirname + "/political.html"));
    } else if (ethnocentric.some((ethnicTerm) => subject === ethnicTerm)) {
        return res.sendFile(path.join(__dirname + "/ethnocentric.html"));
    } else if (analyzedSentiment.score < 0) {
        return res.sendFile(path.join(__dirname + "/disallowed.html"));
    } else if (rootSubdomain === "is" || rootSubdomain === "are") {
        if (rootSubdomain === "is" && subject === "bobcat") {
            return res.redirect(
                "https://www.icloud.com/sharedalbum/#B0I532ODWlUfMV"
            );
        } else if (rootSubdomain === "is" && subject === "tomcat") {
            return res.redirect(
                "https://www.icloud.com/sharedalbum/#B0IGWZuqDGaPwcf"
            );
        } else if (rootSubdomain === "is" && subject === "amyshackles") {
            return res.redirect("https://www.polywork.com/amyshackles");
        } else if (
            rootSubdomain === "are" &&
            (subject === "tomcat-and-bobcat" || subject === "bobcat-and-tomcat")
        ) {
            return res.redirect(
                "https://www.icloud.com/sharedalbum/#B0I5qXGF1Q4g5o"
            );
        }
        return res.sendFile(path.join(__dirname + "/is.html"));
    }
    return res.status(404).send("This is an unsupported use of the domain.");
});


server.listen(PORT);
