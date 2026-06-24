const productRoute = require("./products.route");
const accountRoute = require("./account.route");
const authRoute = require("./auth.route");
const productCategoryRoute = require("./product-category.route");
const roleRoute = require("./role.route");
const cartRoute = require("./cart.route");
const shippingMethodRoute = require("./shipping-method.route");
const paymentRoute = require("./payment.route");
const orderRoute = require("./order.route");
const chatBot = require("./chatbot.route");
const { authMiddleWare } = require("../middleware/auth.middleware");

module.exports = (app) => {
  // Product
  app.use("/api/product", productRoute);

  // Product Category
  app.use("/api/category-product", authMiddleWare, productCategoryRoute);

  app.use("/api/account", accountRoute);

  //   Auth
  app.use("/api", authRoute);

  // Roles
  app.use("/api/roles", authMiddleWare, roleRoute);

  app.use("/api/cart", cartRoute);

  app.use("/api/shipping-method", shippingMethodRoute);

  // payment
  app.use("/api", paymentRoute);

  // order
  app.use("/api/order", orderRoute);

  // Chat bot
  app.use("/api/search", chatBot);
};
