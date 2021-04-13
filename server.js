const express = require("express");
const path = require("path");
const PORT = process.env.PORT || 5000;

const server = express();
server.set("subdomain offset", 0);
server.get("/", (req, res) => {
    if (req.subdomains.includes("are")) {
        return res.sendFile(path.join(__dirname + "/are.html"));
    }
    if (req.subdomains.includes("is")) {
        return res.sendFile(path.join(__dirname + "/is.html"));
    }
    return res.sendFile(path.join(__dirname + "/index.html"));
});
server.listen(PORT);
