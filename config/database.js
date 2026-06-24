const mongoose = require("mongoose");

module.exports.connectMongoose = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Kết nối thành công db");
  } catch (err) {
    console.log(err);
  }
};
