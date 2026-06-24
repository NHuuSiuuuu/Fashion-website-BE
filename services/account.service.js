const AccountModel = require("../models/account.model");
const RoleModel = require("../models/roles.model");
const bcrypt = require("bcrypt");
const AppError = require("../utils/AppError");

module.exports.createAccount = async (newUser) => {
  try {
    const { fullName, email, password, phone, role_id } = newUser;
    const checkAccount = await AccountModel.findOne({
      email: email,
    });

    // Kiểm tra email tồn tại
    if (checkAccount) {
      throw new AppError("Email đã tồn tại", 409);
    }

    // Mã hóa mật khẩu. 10 Là số lần bcrypt lặp thuật toán băm Số càng lớn → hash càng chậm → khó bị brute-force hơn
    const hash = await bcrypt.hash(password, 10);

    // Tạo tài khoản
    const createAccount = await AccountModel.create({
      fullName,
      email,
      password: hash,
      phone,
      role_id,
    });

    // Trả về kết quả
    if (createAccount) {
      return {
        status: "OK",
        message: "SUCCESS",
        data: createAccount,
      };
    }
  } catch (e) {
    throw e;
  }
};

module.exports.createAccountUser = async (fullName, email, password, phone) => {
  const checkAccount = await AccountModel.findOne({
    email: email,
  });

  // Kiểm tra email tồn tại
  if (checkAccount) {
    throw new AppError("Email đã tồn tại", 409);
  }

  const hash = await bcrypt.hash(password, 10);
  const userRole = await RoleModel.findOne({ title: "Khách hàng" });
  console.log(userRole);

  // Tạo tài khoản
  const createAccount = await AccountModel.create({
    fullName,
    email,
    password: hash,
    phone,
    role_id: userRole._id,
  });

  // Trả về kết quả
  if (createAccount) {
    return {
      status: "OK",
      message: "Tạo tài khoản thành công",
      data: createAccount,
    };
  }
};
// Hàm cập nhật
module.exports.updateAccount = async (id, data) => {
  try {
    const checkAccount = await AccountModel.findById(id);

    console.log("checkAccount", checkAccount);

    // // Kiểm tra Account này có tồn tại hay không
    if (!checkAccount) {
      return {
        status: "ERR",
        message: "The user is not defined",
      };
    }

    // // Mã hóa mật khẩu. 10 Là số lần bcrypt lặp thuật toán băm Số càng lớn → hash càng chậm → khó bị brute-force hơn
    // const hash = await bcrypt.hash(password, 10);

    // // Update tài khoản
    const updateAccount = await AccountModel.findByIdAndUpdate(id, data, {
      new: true,
    }); //**new: true → lấy document sau khi update (hiện bản ghi mới luôn)
    console.log("updateAccount", updateAccount);
    // Trả về kết quả
    return {
      status: "OK",
      message: "SUCCESS",
      data: updateAccount,
    };
  } catch (e) {
    throw e;
  }
};

// Hàm chi tiết
module.exports.detailAccount = async (id) => {
  try {
    const checkAccount = await AccountModel.findById(id);

    console.log("checkAccount", checkAccount);

    // // Kiểm tra Account này có tồn tại hay không
    if (!checkAccount) {
      return {
        status: "ERR",
        message: "Account is not defined",
      };
    }

    const detail = await AccountModel.findById(id);
    // Trả về kết quả
    return {
      status: "OK",
      message: "SUCCESS",
      data: detail,
    };
  } catch (e) {
    throw e;
  }
};

// Hàm xóa
module.exports.deleteAccount = async (id) => {
  try {
    const checkAccount = await AccountModel.findById(id);

    if (!checkAccount) {
      return {
        status: "ERR",
        message: "The user is not defined",
      };
    }
    // await AccountModel.findByIdAndDelete(id);
    return {
      status: "OK",
      message: "DELETE USER SUCCESS",
    };
  } catch (e) {
    throw e;
  }
};

module.exports.index = async () => {
  try {
    const data = await AccountModel.find({
      deleted: false,
    });
    return {
      status: "OK",
      data,
    };
  } catch (e) {
    throw e;
  }
};

module.exports.getMe = async (id) => {
  try {
    const data = await AccountModel.findOne({ _id: id, deleted: false })
      .select("fullName email role_id")
      .populate("role_id", "title description permissions");
    return {
      status: "OK",
      data,
    };
  } catch (e) {
    throw e;
  }
};
