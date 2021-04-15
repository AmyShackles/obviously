const express = require("express");
const path = require("path");
const { political } = require("./political.js");
const { disallowed } = require("./disallowed.js");
const { ethnocentric } = require("./ethnocentric.js");
const Sentiment = require("sentiment");
const sentiment = new Sentiment();

const PORT = process.env.PORT || 5000;

const server = express();
server.use("/disallowed", express.static(path.join(__dirname + "/disallowed")));
server.use(
    "/ethnocentric",
    express.static(path.join(__dirname + "/ethnocentric"))
);
server.use("/is", express.static(path.join(__dirname + "/is")));
server.use("/political", express.static(path.join(__dirname + "/political")));

server.get("/", (req, res) => {
    const rootSubdomain = req.subdomains[0];
    const subject = req.subdomains[1];
    const analyzedSentiment = sentiment.analyze(subject, disallowed);
    switch (rootSubdomain) {
        case "are":
            if (political.some((politics) => subject.includes(politics))) {
                return res.sendFile(path.join(__dirname + "/political.html"));
            } else if (analyzedSentiment.score < 0) {
                return res.sendFile(
                    path.join(__dirname + "/aredisallowed.html")
                );
            } 
            return res.sendFile(path.join(__dirname + "/are.html"));
        case "is":
            if (subject === "bobcat") {
                return res.redirect(
                    "https://www.icloud.com/sharedalbum/#B0I532ODWlUfMV"
                );
            } else if (subject === "tomcat") {
                return res.redirect(
                    "https://www.icloud.com/sharedalbum/#B0IGWZuqDGaPwcf"
                );
            }
            if (political.some((politics) => subject.includes(politics))) {
                return res.sendFile(path.join(__dirname + "/political.html"));
            } else if (ethnocentric.some((ethnicTerm) => subject === ethnicTerm)) {
                return res.sendFile(path.join(__dirname + "/ethnocentric.html"));
            } else if (analyzedSentiment.score < 0) {
                return res.sendFile(
                    path.join(__dirname + "/isdisallowed.html")
                );
            } 
            return res.sendFile(path.join(__dirname + "/is.html"));
    }
    return res.status(404).send("This is an unsupported use of the domain.");
});

server.listen(PORT);
