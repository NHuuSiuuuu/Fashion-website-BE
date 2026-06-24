// Chỉ admin mới xóa được user
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const jwtService = require("../services/jwt.service");
const AppError = require("../utils/AppError");
// Để có quyền vào các trang thì phải đi qua được bước xác thưc này

module.exports.authMiddleWare = async (req, res, next) => {
  try {
    // jwt.verify() dùng để:
    // Kiểm tra token có hợp lệ không
    // Kiểm tra token có bị giả mạo không
    // Lấy dữ liệu đã được mã hóa trong token

    const refreshToken = req.cookies?.refresh_token;
    const accessToken = req.cookies?.access_token;
    // Ưu tiên dùng access_token nếu còn hợp lệ
    if (accessToken) {
      try {
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN);
        req.account = decoded;
        return next();
      } catch (e) {
        // access_token lỗi/hết hạn -> fallback xuống refresh_token
      }
    }

    // Không có access_token hợp lệ thì bắt buộc phải có refresh_token
    if (!refreshToken) {
      throw new AppError("Hết phiên đăng nhập", 401);
    }

    try {
      // Giải mã refresh_token
      const decodeRefresh = jwt.verify(refreshToken, process.env.REFRESH_TOKEN);

      // Tạo access_token mới
      const newAccessToken = await jwtService.generalAccessToken({
        id: decodeRefresh.id,
        permissions: decodeRefresh.permissions,
      });
      res.cookie("access_token", newAccessToken, {
        httpOnly: true, // Chặn truy cập từ JavaScript (bảo mật hơn)
        secure: false, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
        sameSite: "Strict", // Chống tấn công CSRF
        maxAge: 15 * 60 * 1000, // 15 phút
      });
      // Set lại refresh_token để gia hạn cookie
      res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "Strict",
        maxAge: 365 * 24 * 60 * 60 * 1000, // 365 ngày
      });

      req.account = decodeRefresh;

      return next();
    } catch (e) {
      throw new AppError("Token không hợp lệ", 401);
    }
  } catch (e) {
    return res.status(e.status || 500).json({
      status: "ERR",
      message: e.message,
    });
  }
};
