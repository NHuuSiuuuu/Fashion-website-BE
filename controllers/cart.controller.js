const CartService = require("../services/cart.service");

module.exports.createCart = async (req, res) => {
  try {
    const result = await CartService.createCart(req.body);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(e.status || 500).json({
      message: e.message,
    });
  }
};

module.exports.getCart = async (req, res) => {
  try {
    const { cart_id } = req.body;
    console.log("cart_id", cart_id);
    const result = await CartService.getCart(cart_id);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({
      message: e.message,
    });
  }
};

module.exports.deleteProductInCart = async (req, res) => {
  try {
    const { cart_id, product_id, size_id } = req.body;
    console.log("cart_id", cart_id);
    console.log("product_id", product_id);
    console.log("size_id", size_id);

    const result = await CartService.deleteProductInCart(
      cart_id,
      product_id,
      size_id,
    );
    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({
      message: e.message,
    });
  }
};

module.exports.updateProductInCart = async (req, res) => {
  try {
    const { cart_id, product_id, size_id, quantity } = req.body;

    const result = await CartService.updateProductInCart(
      cart_id,
      product_id,
      size_id,
      quantity,
    );
    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({
      message: e.message,
    });
  }
};
