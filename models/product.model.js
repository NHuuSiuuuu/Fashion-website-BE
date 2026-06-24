const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater"); // Tự tạo slug từ title
mongoose.plugin(slug);

const productSchema = new mongoose.Schema({
  title: String,
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "category",
    default: null,
  },
  description: String,
  price: Number,
  discountPercentage: Number,
  stock: Number,

  sizes: [
    {
      name: {
        type: String,
        enum: ["S", "M", "L", "XL"],
      },
      stock: {
        type: Number,
        min: 0,
      },
    },
  ],

  thumbnail: {
    type: [String],
    // default: [],
  },
  status: String,
  featured: String,
  position: Number,
  slug: {
    type: String,
    slug: "title", // san-pham-1
    unique: true, // chỉ tạo slug duy nhất
  },

  //  ai tạo - ngày tạo
  createBy: {
    account_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
    },
    // Thời gian tạo
    createdAt: Date,
  },

  //  ai xóa - ngày xóa
  deletedBy: {
    account_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
    },
    deletedAt: Date,
  },
  updatedBy: [
    {
      account_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
      },
      updatedAt: Date,
    },
  ],

  deleted: {
    type: Boolean,
    default: false,
  },
});

productSchema.index({ title: "text" });

const Product = mongoose.model("Product", productSchema, "Product");

module.exports = Product;
