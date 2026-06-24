const AuthService = require("../services/auth.service");
const jwtService = require("../services/jwt.service");
const { permissions } = require("./role.controller");
const AppError = require("../utils/AppError");

// http://localhost:3001/api/login
module.exports.login = async (req, res) => {
  try {
    // console.log(req.body);
    const { email, password } = req.body; // thằng passwordConfirm này ko lưu trong model nó chỉ so sánh với password thôi

    // Kiểm tra email có đúng định dạng hay không
    const reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;

    const isCheckEmail = reg.test(email); // true là hợp lệ - false sai format
    if (!email || !password) {
      return res.status(200).json({
        status: "ERR",
        message: "Vui lòng nhâp đầy đủ email và mật khẩu",
      });
    } else if (!isCheckEmail) {
      return res.status(200).json({
        status: "ERR",
        message: "Email không đúng định dạng ",
      });
    }

    // Gọi service xử lý tạo Account và trả kết quả cho client
    const result = await AuthService.Login(email, password);

    res
      .cookie("access_token", result.access_token, {
        httpOnly: true, // Chặn truy cập từ JavaScript (bảo mật hơn)
        secure: false, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
        sameSite: "Strict", // Chống tấn công CSRF
        maxAge: 15 * 60 * 1000, // 15 phút
      })
      .cookie("refresh_token", result.refresh_token, {
        httpOnly: true, // Chặn truy cập từ JavaScript (bảo mật hơn)
        secure: false, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
        sameSite: "Strict", // Chống tấn công CSRF
        maxAge: 365 * 24 * 60 * 60 * 1000, // 365 ngày
      });
    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({
      status: "ERR",
      message: e,
    });
  }
};

module.exports.logout = async (req, res) => {
  try {
    res
      .clearCookie("access_token", {
        httpOnly: true,
        secure: false,
        sameSite: "Strict",
      })
      .clearCookie("refresh_token", {
        httpOnly: true,
        secure: false,
        sameSite: "Strict",
      });
    return res.status(200).json({
      status: "OK",
      message: "Đăng xuất thành công",
    });
  } catch (e) {
    return res.status(500).json({
      status: "ERR",
      message: e,
    });
  }
};

module.exports.refreshToken = async (req, res) => {
  try {
    // Lấy từ cookie
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) {
      throw new AppError("Không có refresh token", 401);
    }
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN);

    // Tạo access_token mới
    const newAccessToken = await jwtService.generalAccessToken({
      id: decoded.id,
      permissions: decoded.permissions,
    });
    res.cookie("access_token", newAccessToken, {
      httpOnly: true, // Chặn truy cập từ JavaScript (bảo mật hơn)
      secure: false, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
      sameSite: "Strict", // Chống tấn công CSRF
      maxAge: 15 * 60 * 1000, // 15 phút
    });

    return res.status(200).json({
      status: "OK",
      message: "Refresh token thành công",
    });
  } catch (e) {
    return res.status(500).json({
      message: e.message,
    });
  }
};
