const ProductCategoryModel = require("../models/product-category.model");

// Lấy danh sách dạng TREE
module.exports.getTree = async () => {
  const categories = await ProductCategoryModel.find({ deleted: false }).lean(); // Dùng lean để trả về json thuần
  // console.log(categories);
  function buildTree(parentId = null) {
    return categories
      .filter((item) =>
        parentId === null
          ? item.parent_id === null
          : item.parent_id?.toString() === parentId,
      )
      .map((item) => ({
        ...item,
        children: buildTree(item._id.toString()),
      }));
  }
  const tree = buildTree();

  // IN RA KẾT QUẢ TREE
  // console.log("CATEGORY TREE:");
  // console.log(JSON.stringify(tree, null, 2));

  return tree;
};

// [CREATE] Tạo danh mục sản phẩm
// http://localhost:3001/api/category-product/create
module.exports.create = async (data) => {
  let { title, description, thumbnail, status, position, parent_id } = data;

  if (!position) {
    const countCategory = await ProductCategoryModel.countDocuments();
    position = countCategory + 1;
  }
  const newCategoryProduct = await ProductCategoryModel.create({
    title,
    description,
    thumbnail,
    status,
    position,
    parent_id,
  });
  if (newCategoryProduct) {
    return {
      status: "OK",
      message: "SUCCESS",
      data: newCategoryProduct,
    };
  }

  try {
  } catch (e) {
    throw e;
  }
};

// [PATCH] Sửa danh mục sản phẩm
// http://localhost:3001/api/category-product/update/:id
module.exports.update = async (id, data) => {
  try {
    const checkProductCategory = await ProductCategoryModel.findById(id);
    if (!checkProductCategory) {
      return {
        status: "ERR",
        message: "The category product is not defined",
      };
    }
    const updateCategoryProduct = await ProductCategoryModel.findByIdAndUpdate(
      id,
      data,
      { new: true },
    );
    return {
      status: "OK",
      message: "SUCCESS",
      updateCategoryProduct,
    };
  } catch (e) {
    throw e;
  }
};

// [PATCH] Xóa danh mục sản phẩm
// http://localhost:3001/api/category-product/delete/:id
module.exports.delete = async (id) => {
  try {
    const checkProductCategory = await ProductCategoryModel.findById(id);
    if (!checkProductCategory) {
      return {
        status: "ERR",
        message: "The category product is not defined",
      };
    }
    const deleteCategoryProduct = await ProductCategoryModel.findByIdAndUpdate(
      id,
      { deleted: "true" },
      { new: true },
    );
    return {
      status: "OK",
      message: "SUCCESS",
      deleteCategoryProduct,
    };
  } catch (e) {
    throw e;
  }
};

// [GET] Chi tiết danh mục sản phẩm
// http://localhost:3001/api/category-product/detail/:id
module.exports.detailProductCategory = async (id) => {
  try {
    const productCategory = await ProductCategoryModel.findById(id);
    if (productCategory) {
      return {
        status: "OK",
        productCategory,
      };
    }
  } catch (e) {
    throw e;
  }
};

// [GET] Danh sách các danh mục sản phẩm
// http://localhost:3001/api/category-product/productCategories?page=1
module.exports.productCategories = async (limit, page, filter, sort) => {
  try {
    /* ======================
      Filter (filter=status:active)
    ====================== */
    const find = { deleted: false };
    if (filter) {
      let [field, status] = filter.split(":");
      find[field] = status;
    }
    /* ======================
      Sắp xếp (sort=position:asc)
    ====================== */
    const objSort = {};
    if (sort) {
      let [field, order] = sort.split(":");
      if (order === "asc") {
        objSort[field] = 1;
      } else {
        objSort[field] = -1;
      }
    }

    const productCategories = await ProductCategoryModel.find(find)
      .limit(limit)
      .skip(page * limit)
      .sort(objSort);

    if (productCategories) {
      const totalProductCategory = await ProductCategoryModel.countDocuments({
        deleted: false,
      });

      return {
        status: "OK",
        productCategories,
        total: totalProductCategory,
        pageCurrent: Number(page + 1),
        totalPage: Math.ceil(totalProductCategory / limit),
      };
    }
  } catch (e) {
    throw e;
  }
};
