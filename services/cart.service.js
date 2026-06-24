const CartModel = require("../models/cart.model");
const ProductModel = require("../models/product.model");
const AppError = require("../utils/AppError");

module.exports.createCart = async (data) => {
  const { cart_id, product_id, quantity, size_id } = data;

  //Kiểm tra số lượng sản phẩm tương ứng với size đấy trong giỏ hàng có vượt quá số lượng trong data base ko
  const product = await ProductModel.findOne({ _id: product_id }).select(
    "sizes",
  );

  if (!product) {
    throw new AppError("Không tìm thấy sản phẩm", 404);
  }
  // Tìm size
  const size = product.sizes.find((s) => s._id.toString() === size_id);

  if (!size) {
    throw new AppError("Không tìm thấy size", 404);
  }
  // Check stock trước
  if (quantity > size.stock) {
    throw new AppError("Số lượng vượt quá tồn kho", 400);
  }

  // Kiem tra xem da co cart chua?
  let cart = await CartModel.findOne({ cart_id });

  if (!cart) {
    // Chua co thi tao
    await CartModel.create({
      cart_id,
      products: [{ product_id, quantity, size_id }],
    });
    return {
      status: "OK",
      message: "Thêm vào giỏ hàng thành công",
      data: {
        cart_id,
        product_id,
        quantity,
        size_id,
      },
    };
  }
  // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa? sản phẩm vừa thêm có trùng size không?
  // nếu có rồi thì chỉ tăng số lượng thôi
  const existProductInCart = cart.products.find(
    (item) =>
      item.product_id.toString() === product_id &&
      item.size_id.toString() === size_id,
  );

  if (existProductInCart) {
    if (existProductInCart.quantity + quantity > size.stock) {
      throw new AppError("Số lượng vượt quá tồn kho", 400);
    }
    existProductInCart.quantity += quantity;
  } else {
    if (quantity > size.stock) {
      throw new AppError("Số lượng vượt quá tồn kho", 400);
    }
    //  push vào mảng products thôi
    cart.products.push({ product_id, quantity, size_id });
  }

  await cart.save();
  return {
    status: "OK",
    message: "Thêm vào giỏ hàng thành công",
    data: {
      cart_id,
      product_id,
      quantity,
      size_id,
    },
  };
};

module.exports.getCart = async (cart_id) => {
  try {
    const cart = await CartModel.findOne({ cart_id }).populate(
      "products.product_id",
      " title price discountPercentage slug thumbnail sizes ",
    );

    return {
      status: "OK",
      message: "SUCCESS",
      cart,
    };
  } catch (e) {
    throw e;
  }
};

module.exports.deleteProductInCart = async (cart_id, product_id, size_id) => {
  try {
    const cart = await CartModel.updateOne(
      {
        cart_id: cart_id,
      },
      {
        // Loại bỏ obj này khỏi mảng products
        $pull: {
          products: { product_id: product_id, size_id: size_id },
        },
      },
    );
    return {
      status: "OK",
      message: "SUCCESS",
      cart,
    };
  } catch (e) {
    throw e;
  }
};

module.exports.updateProductInCart = async (
  cart_id,
  product_id,
  size_id,
  quantity,
) => {
  try {
    // console.log("cart_id", cart_id);
    // console.log("product_id", product_id);
    // console.log("size_id", size_id);
    // console.log("quantity", quantity);
    const cart = await CartModel.updateOne(
      {
        cart_id: cart_id,
        "products.product_id": product_id,
        "products.size_id": size_id,
      },
      {
        $set: {
          // Thằng $ là để tìm phần tử ĐẦU TIÊN trong mảng products thỏa mãn điều kiện query trên kia
          "products.$.quantity": quantity,
        },
      },
      {
        new: true,
      },
    );
    return {
      status: "OK",
      message: "SUCCESS",
      cart,
    };
  } catch (e) {
    throw e;
  }
};
