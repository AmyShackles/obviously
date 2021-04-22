const mongoose = require("mongoose");

const LogSchema = mongoose.Schema(
    {
        rootSubdomain: String,
        subject: String,
        subdomain: String,
        ip: String,
        ips: [String],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Log", LogSchema);
