const express = require("express");
const path = require("path");
const { political } = require("./political.js");
const { disallowed } = require("./disallowed.js");
const { SentimentAnalyzer, PorterStemmer } = require("natural");

const PORT = process.env.PORT || 5000;

const server = express();
server.use("/disallowed", express.static(path.join(__dirname + "disallowed")));
server.use("/is", express.static(path.join(__dirname + "is")));
server.use("/is-not", express.static(path.join(__dirname + "is-not")));
server.use("/political", express.static(path.join(__dirname + "political")));

server.get("/", (req, res) => {
    const rootSubdomain = req.subdomains[0];
    const subject = req.subdomains[1];
    const analyzer = new SentimentAnalyzer("English", PorterStemmer, "afinn");
    const sentiment = subject && analyzer.getSentiment([subject]);
    switch (rootSubdomain) {
        case "are":
            if (
                sentiment < 0 ||
                disallowed.some((banned) => banned.includes(subject))
            ) {
                return res.sendFile(
                    path.join(__dirname + "/disallowed/aredisallowed.html")
                );
            } else if (
                political.some((politics) => politics.includes(subject))
            ) {
                return res.sendFile(path.join(__dirname + "/political/political.html"));
            }
            return res.sendFile(path.join(__dirname + "/is/are.html"));
        case "is":
            if (
                sentiment < 0 ||
                disallowed.some((banned) => banned.includes(subject))
            ) {
                return res.sendFile(
                    path.join(__dirname + "/disallowed/isdisallowed.html")
                );
            } else if (
                political.some((politics) => politics.includes(subject))
            ) {
                return res.sendFile(path.join(__dirname + "/political/political.html"));
            }
            return res.sendFile(path.join(__dirname + "/is/is.html"));
        case "not":
            if (req.subdomains[1] === "is") {
                if (political.some((politics) => politics.includes(subject))
                ) {
                    return res.sendFile(path.join(__dirname + "/political/political.html"));
                }
                return res.sendFile(path.join(__dirname + "/is-not/isnot.html"));
            } else if (req.subdomains[1] === "are") {
                if (political.some((politics) => politics.includes(subject))
                ) {
                    return res.sendFile(path.join(__dirname + "/political/political.html"));
                }
                return res.sendFile(path.join(__dirname + "/is-not/arenot.html"));
            }
    }
    return res.status(404).send("This is an unsupported use of the domain.");
});

server.listen(PORT);
