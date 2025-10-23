const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URL, {});

const { connection } = mongoose;

connection.once('open', () => {
    console.log("DB is connected");
})