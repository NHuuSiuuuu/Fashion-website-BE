const RoleModel = require("../models/roles.model");

module.exports.create = async (data) => {
  try {
    const newRole = await RoleModel.create(data);
    return {
      status: "OK",
      message: "SUCCESS",
      data: newRole,
    };
  } catch (e) {
    throw e;
  }
};

module.exports.update = async (id, data) => {
  try {
    const checkRole = await RoleModel.findById(id);
    if (!checkRole) {
      return {
        status: "ERR",
        message: "Role is not defined",
      };
    }
    const updateRole = await RoleModel.findByIdAndUpdate(id, data, {
      new: true,
    });
    return {
      status: "OK",
      message: "SUCCESS",
      updateRole,
    };
  } catch (e) {
    throw e;
  }
};

module.exports.delete = async (id) => {
  try {
    const checkRole = await RoleModel.findById(id);
    if (!checkRole) {
      return {
        status: "ERR",
        message: "Role is not defined",
      };
    }
    const deleteRole = await RoleModel.findByIdAndDelete(id);
    return {
      status: "OK",
      message: "SUCCESS",
    };
  } catch (e) {
    throw e;
  }
};

module.exports.index = async (id) => {
  try {
    const data = await RoleModel.find({ deleted: false });
    return {
      status: "OK",
      message: "SUCCESS",
      data,
    };
  } catch (e) {
    throw e;
  }
};

module.exports.detail = async (id) => {
  try {
    const data = await RoleModel.findById(id);
    if (!data) {
      return {
        status: "ERR",
        message: "Role is not defined",
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

module.exports.permissions = async (data) => {
  try {
    // data này là mảng bắt buộc bên frontend gửi về là mảng
    for (const item of data) {
      await RoleModel.updateOne(
        { _id: item.id },
        { permissions: item.permissions },
      );
    }
  } catch (e) {
    throw e;
  }
};
