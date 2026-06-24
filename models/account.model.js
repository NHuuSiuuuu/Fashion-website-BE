const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    role_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
    },


    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
  },
  {
    timestamps: true,
  },
);

const Account = mongoose.model("Account", accountSchema, "Account");
module.exports = Account;
