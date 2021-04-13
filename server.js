const express = require("express");
const path = require("path");
const PORT = process.env.PORT || 5000;

const server = express();
server.set("subdomain offset", 0);
server.get("/", (req, res) => {
    console.dir(req.subdomains);
    return res.sendFile(path.join(__dirname + "/index.html"));
});
server.listen(PORT);
