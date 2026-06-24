const ProductModel = require("../models/product.model");
const AccountModel = require("../models/account.model");
const { default: mongoose } = require("mongoose");

// [CREATE] Thêm sản phẩm
// http://localhost:3001/api/product/create
module.exports.createProduct = async (data, idAccount) => {
  try {
    let {
      title,
      description,
      price,
      discountPercentage,
      stock,
      sizes,
      thumbnail,
      featured,
      position,
      status,
      category_id,
    } = data;

    if (!position) {
      const countProduct = await ProductModel.countDocuments();
      position = countProduct + 1;
    }
    if (typeof sizes === "string") {
      sizes = JSON.parse(sizes);
    }
    const totalStock = sizes.reduce((sum, item) => sum + Number(item.stock), 0);

    const newProduct = await ProductModel.create({
      title,
      description,
      price,
      discountPercentage,
      stock: totalStock,
      sizes,
      thumbnail,
      featured,
      position,
      status,
      category_id,

      // 👇 createBy
      createBy: {
        account_id: idAccount, // lấy từ token
        createdAt: new Date(),
      },
    });

    return {
      status: "OK",
      message: "SUCCESS",
      data: newProduct,
    };
  } catch (e) {
    throw e;
  }
};

// [PATCH] Sửa sản phẩm
// http://localhost:3001/api/product/update/:id
module.exports.upDateProduct = async (id, data, idAccount) => {
  try {
    const checkProduct = await ProductModel.findById(id);
    let updateData = { ...data };

    if (!checkProduct) {
      return {
        status: "ERR",
        message: "The product is not defined",
      };
    }

    if (typeof data.sizes === "string") {
      updateData.sizes = JSON.parse(data.sizes);
    }
    if (data.sizes) {
      updateData.stock = updateData.sizes.reduce(
        (sum, item) => sum + Number(item.stock),
        0,
      );
    }

    const updateProduct = await ProductModel.findByIdAndUpdate(
      id,
      {
        ...updateData,
        $push: {
          updatedBy: {
            account_id: idAccount,
            updatedAt: new Date(),
          },
        },
      },
      {
        new: true,
      },
    );
    return {
      status: "OK",
      message: "SUCCESS",
      updateProduct,
    };
  } catch (e) {
    throw e;
  }
};

// [PATCH] Xóa sản phẩm (xóa mềm)
// http://localhost:3001/api/product/delete/:id
module.exports.deleteProduct = async (id) => {
  try {
    const checkProduct = await ProductModel.findById(id);

    if (!checkProduct) {
      return {
        status: "ERR",
        message: "The product is not defined",
      };
    }
    const deleteProduct = await ProductModel.findByIdAndUpdate(
      id,
      { deleted: true },
      { new: true },
    );
    return {
      status: "OK",
      message: "DELETE USER SUCCESS",
    };
  } catch (e) {
    throw e;
  }
};

// [GET] Chi tiết sản phẩm
// http://localhost:3001/api/product/detail/:id
module.exports.detailProduct = async (param) => {
  try {
    // Kiểm tra xem gửi lên là id hay là slug
    const checkObject = mongoose.Types.ObjectId.isValid(param);

    // Nếu gửi lên là id thì tìm kiếm theo id, còn nếu là slug thì tìm kiếm theo slug
    // Vì mongoose khi tìm kiếm theo id thì phải đúng định dạng id 24 kí tự
    const find = checkObject ? { _id: param } : { slug: param };

    const product = await ProductModel.findOne(find)
      .populate("updatedBy.account_id", "fullName email") // Chỉ lấy fullName và email thôi
      .populate("createBy.account_id", "fullName email"); // Chỉ lấy fullName và email thôi;
    console.log(product);
    if (product) {
      return {
        status: "OK",
        product,
      };
    }
  } catch (e) {
    throw e;
  }
};

// [GET] Danh sách các sản phẩm
// http://localhost:3001/api/product/products?page....
module.exports.products = async (limit, page, sort, filter, search) => {
  try {
    const find = {
      deleted: false,
    };


    if (search) {
      const [field, value] = search.split(":");

      find[field] = {
        $regex: value,
        $options: "i", // không phân biệt hoa thường
      };
    }
    console.log("find", find);
    /* ======================
      Lọc (filter=status:active)
    ====================== */
    if (filter) {
      // Nếu chỉ có 1 filter
      if (typeof filter == "string") {
        // Dùng cú pháp destructuring
        const [field, value] = filter.split(":");
        find[field] = value;
      }

      // Nếu có nhiều filter - nhiều query param trùng tên sẽ trả về ARRAY
      if (Array.isArray(filter)) {
        filter.forEach((item) => {
          const [filed, value] = item.split(":");
          find[filed] = value;
        });
      }
    }

    /* ======================
      Sắp xếp (sort=price:asc)
    ====================== */
    let objSort = { title: 1 }; // Mặc định sắp xếp A-Z
    if (sort) {
      const [field, order] = sort.split(":"); // [price, asc]
      if (order === "asc") {
        objSort = { [field]: 1 }; // { price: 1 }
      } else {
        objSort = { [field]: -1 };
      }
    }

    // console.log(find);

    const products = await ProductModel.find(find)
      .populate("updatedBy.account_id", "fullName email") // Chỉ lấy fullName và email thôi
      .populate("createBy.account_id", "fullName email") // Chỉ lấy fullName và email thôi
      .limit(limit)
      .skip(limit * page)
      .sort(objSort);

    // Tổng sản phẩm
    const totalProducts = await ProductModel.countDocuments({ deleted: false });
    if (products) {
      return {
        status: "OK",
        message: "SUCCESS",
        products,
        total: totalProducts,
        pageCurrent: Number(page + 1),
        totalPage: Math.ceil(totalProducts / limit),
      };
    }
  } catch (e) {
    throw e;
  }
};

// APi này bên khách hàng
module.exports.getProducts = async (limit, page, sort, filter) => {
  try {
    const find = {
      deleted: false,
    };

    /* ======================
    Sau làm sản phẩm nổi bật hay khôgn
      Lọc (filter=status:active) 
    ====================== */
    if (filter) {
      // Nếu chỉ có 1 filter
      if (typeof filter == "string") {
        // Dùng cú pháp destructuring
        const [field, value] = filter.split(":");
        find[field] = value;
      }

      // Nếu có nhiều filter - nhiều query param trùng tên sẽ trả về ARRAY
      if (Array.isArray(filter)) {
        filter.forEach((item) => {
          const [filed, value] = item.split(":");
          find[filed] = value;
        });
      }
    }

    /* ======================
      Sắp xếp (sort=price:asc)
    ====================== */
    let objSort = { title: 1 }; // Mặc định sắp xếp A-Z
    if (sort) {
      let [field, order] = sort.split(":"); // [price, asc]
      if (field === "createdAt") {
        field = "createBy.createdAt";
      }

      if (order === "asc") {
        objSort = { [field]: 1 }; // { price: 1 }
      } else {
        objSort = { [field]: -1 };
      }
    }
    console.log(objSort);

    console.log(limit);

    const products = await ProductModel.find(find)
      .limit(limit)
      .skip(limit * (page - 1))
      .sort(objSort)
      .select(
        "title price discountPercentage thumbnail slug stock sizes  createBy.createdAt",
      );

    // Tổng sản phẩm
    const totalProducts = await ProductModel.countDocuments({ deleted: false });
    if (products) {
      return {
        status: "OK",
        message: "SUCCESS",
        products,
        total: totalProducts,
        pageCurrent: Number(page),
        totalPage: Math.ceil(totalProducts / limit),
      };
    }
  } catch (e) {
    throw e;
  }
};

module.exports.getProductsCategory = async (limit, page, sort, filter, id) => {
  try {
    const find = {
      deleted: false,
      category_id: id,
    };

    /* ======================
    Sau làm sản phẩm nổi bật hay khôgn
      Lọc (filter=status:active) 
    ====================== */
    if (filter) {
      // Nếu chỉ có 1 filter
      if (typeof filter == "string") {
        // Dùng cú pháp destructuring
        const [field, value] = filter.split(":");
        find[field] = value;
      }

      // Nếu có nhiều filter - nhiều query param trùng tên sẽ trả về ARRAY
      if (Array.isArray(filter)) {
        filter.forEach((item) => {
          const [filed, value] = item.split(":");
          find[filed] = value;
        });
      }
    }

    /* ======================
      Sắp xếp (sort=price:asc)
    ====================== */
    let objSort = { title: 1 }; // Mặc định sắp xếp A-Z
    if (sort) {
      let [field, order] = sort.split(":"); // [price, asc]
      if (field === "createdAt") {
        field = "createBy.createdAt";
      }

      if (order === "asc") {
        objSort = { [field]: 1 }; // { price: 1 }
      } else {
        objSort = { [field]: -1 };
      }
    }
    console.log(objSort);

    // console.log(find);

    const products = await ProductModel.find(find)
      .limit(limit)
      .skip(limit * (page - 1))
      .sort(objSort)
      .select(
        "title price discountPercentage thumbnail slug stock  createBy.createdAt",
      );

    // Tổng sản phẩm
    const totalProducts = await ProductModel.countDocuments({
      deleted: false,
      category_id: id,
    });
    if (products) {
      return {
        status: "OK",
        message: "SUCCESS",
        products,
        total: totalProducts,
        pageCurrent: Number(page),
        totalPage: Math.ceil(totalProducts / limit),
      };
    }
  } catch (e) {
    throw e;
  }
};

module.exports.searchProducts = async (keyword) => {
  try {
    const find = {
      deleted: false,
      title: {
        $regex: keyword,
        $options: "i",
      },
    };
    console.log(keyword);

    const products = await ProductModel.find(find)
      .limit(10)

      .select("title price discountPercentage slug thumbnail");

    if (products) {
      return {
        status: "OK",
        message: "SUCCESS",
        products,
      };
    }
  } catch (e) {
    throw e;
  }
};

module.exports.relatedProducts = async (id) => {
  try {
    const find = {
      deleted: false,
      _id: id,
    };

    const products = await ProductModel.find(find).select("category_id");

    const categoryId = products[0].category_id;

    const relatedProducts = await ProductModel.find({
      _id: { $ne: id },
      status: "active",
      deleted: false,
    })
      .select("title price discountPercentage thumbnail slug stock sizes ")
      .limit(5);

    if (products) {
      return {
        status: "OK",
        message: "SUCCESS",
        relatedProducts,
      };
    }
  } catch (e) {
    throw e;
  }
};
