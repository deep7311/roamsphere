const mongoose = require("mongoose");
const initData = require("./data.js");  // require data.js file which we exports
const Listing = require("../models/listing.js"); // require the listing model from models folder

//--- connecting to DataBase start ---
const MONGO_URL = "mongodb://127.0.0.1:27017/roamsphere";

main()
    .then(() => {
        console.log("Connected to DataBase");
    }).catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}

//Initialize DataBase

const initDB = async () => {
    await Listing.deleteMany({});
    await Listing.insertMany(initData.data);
    console.log("data initialize successfully!");
};

initDB();