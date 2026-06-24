const RoleModel = require("../models/roles.model");
const AccountModel = require("../models/account.model");

module.exports.checkPermission = (permission) => {
  return async (req, res, next) => {
    try {
      const account_id = req.account.id;
      // console.log("account_id", account_id);
      if (!account_id)
        return res.status(401).json({
          message: "Tài khoản không xác định!",
        });

      // Lấy role id trong Account
      const Account = await AccountModel.findById(account_id);

      // Lấy permission trong database chứ không lấy từ access_token
      const Role = await RoleModel.findById(Account.role_id);
      // console.log("Role trong database: ", Role);

      const permissions = Role.permissions || [];

      if (!permissions.includes(permission)) {
        return res.status(403).json({
          message: "Không có quyền truy cập",
        });
      }

      next();
    } catch (e) {
      return res.status(500).json({
        message: "Lỗi server",
        error: e.message,
      });
    }
  };
};
