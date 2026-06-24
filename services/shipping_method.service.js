const ShippingMethod = require("../models/shippingMethod.model");

module.exports.create = async (data) => {
  try {
    let {
      code,
      name,
      thumbnail,
      description,
      fee,
      freeThreshold,
      status,
      deliveryTime,
      isDefault,
    } = data;
    console.log('data',data)
    const result = await ShippingMethod.create({
      code,
      name,
      thumbnail,
      description,
      fee,
      freeThreshold,
      status,
      deliveryTime,
      isDefault,
    });
    return {
      status: "OK",
      message: "SUCCESS",
      result,
    };
  } catch (e) {
    throw e;
  }
};

module.exports.update = async (id, data) => {
  try {
    const check = await ShippingMethod.findById(id);
    if (!check) {
      return {
        status: "ERR",
        message: "Shipping method is not defined",
      };
    }
    const updateShippingMethod = await ShippingMethod.findByIdAndUpdate(
      id,
      data,
      {
        new: true,
      },
    );

    return {
      status: "OK",
      message: "SUCCESS",
      updateShippingMethod,
    };
  } catch (e) {
    throw e;
  }
};

module.exports.delete = async (id) => {
  try {
    const result = await ShippingMethod.findByIdAndDelete(id);
    return {
      status: "OK",
      message: "SUCCESS",
    };
  } catch (e) {
    throw e;
  }
};

module.exports.index = async (limit, page, sort, filter) => {
  try {
    const find = {
      deleted: false,
    };

    if (filter) {
      const [field, value] = filter.split(":");
      find[field] = value;
    }
    let objSort = { name: 1 };
    if (sort) {
      const [field, order] = sort.split(":");
      if (order === "asc") {
        objSort = { [field]: 1 };
      } else {
        objSort = { [field]: -1 };
      }
    }
    // Tổng phương thức vận chuyển
    const totalShippingMethod = await ShippingMethod.countDocuments({
      deleted: false,
    });

    console.log(totalShippingMethod);
    console.log("objSort", objSort);
    const data = await ShippingMethod.find(find).sort(objSort);
    return {
      status: "OK",
      message: "SUCCESS",
      data,
      total: totalShippingMethod,
      pageCurrent: Number(page + 1),
      limit,
      totalPage: Math.ceil(totalShippingMethod / limit),
    };
  } catch (e) {
    throw e;
  }
};

module.exports.detail = async (id) => {
  try {
    const data = await ShippingMethod.findById(id);
    if (!data) {
      return {
        status: "ERR",
        message: "Shipping method is not defined",
      };
    } else {
      return {
        status: "OK",
        message: "SUCCESS",
        data,
      };
    }
  } catch (e) {
    throw e;
  }
};
