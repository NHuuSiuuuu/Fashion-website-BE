const AccountModel = require("../models/account.model");
const RoleModel = require("../models/roles.model");
const bcrypt = require("bcrypt");

const jwtService = require("../services/jwt.service");
const jwt = require("jsonwebtoken");

module.exports.Login = async ( email, password) => {
  try {
    const checkAccount = await AccountModel.findOne({
      email: email,
    });

    //  1. Nếu không có email trong db
    if (!checkAccount) {
      return {
        status: "ERR",
        message: "Email không tồn tại trong hệ thống",
      };
    }

    // 2.  Nếu có email: So sánh xem pw đã nhập và pw trong database khác gì nhau
    const comparePassword = await bcrypt.compare(
      password,
      checkAccount.password,
    );
    //   console.log("comparePassword", comparePassword);
    // 3. Nếu không bằng nhau
    if (!comparePassword) {
      return {
        status: "ERR",
        message: "Mật khẩu không đúng", // Mật khẩu không đúng
      };
    }
    const role = await RoleModel.findById(checkAccount.role_id);
    // console.log(role);
    console.log("đăng nhập thành công");
    // access token
    const access_token = await jwtService.generalAccessToken({
      id: checkAccount.id,
      permissions: role.permissions,
    });

    // refresh token
    const refresh_token = await jwtService.generalRefreshToken({
      id: checkAccount.id,
      permissions: role.permissions,
    });
   

    return {
      status: "OK",
      message: "SUCCESS",
      access_token: access_token, // trả về user mới login
      refresh_token: refresh_token,
    };
  } catch (e) {
    throw e;
  }
};

// module.exports.refreshToken = async (refreshToken) => {
//   try {
//     if (!refreshToken) {
//       return {
//         status: "ERR",
//         message: "Refresh token is required",
//       };
//     }

//     // Kiểm tra + giải mã + xác thực token
//     const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN);
//     // decoded = { id, permissions, iat, exp }

//     const newAccessToken = await jwtService.generalAccessToken({
//       id: decoded.id,
//       permissions: decoded.permissions,
//     });
//     return {
//       status: "OK",
//       access_token: newAccessToken,
//     };
//   } catch (e) {
//     throw e;
//   }
// };
