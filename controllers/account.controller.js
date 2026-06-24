const AccountService = require("../services/account.service");

module.exports.createAccount = async (req, res) => {
  try {
    // console.log(req.body);
    const { fullName, email, password, passwordConfirm, phone, role_id } =
      req.body; // thằng passwordConfirm này ko lưu trong model nó chỉ so sánh với password thôi

    // Kiểm tra email có đúng định dạng hay không
    const reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;

    const isCheckEmail = reg.test(email); // true là hợp lệ - false sai format
    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({
        message: "The input is required",
      });
    } else if (!isCheckEmail) {
      return res.status(400).json({
        message: "The input is email",
      });
    } else if (password != passwordConfirm) {
      return res.status(400).json({
        message: "The password is equal confirmPassword",
      });
    }

    // Gọi service xử lý tạo Account và trả kết quả cho client
    const result = await AccountService.createAccount(req.body);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(e.status || 500).json({
      message: e.message,
    });
  }
};

module.exports.createAccountUser = async (req, res) => {
  try {
    // console.log(req.body);
    const { fullName, email, password, passwordConfirm, phone } = req.body;

    // Gọi service xử lý tạo Account và trả kết quả cho client
    const result = await AccountService.createAccountUser(
      fullName,
      email,
      password,
      passwordConfirm,
      phone,
    );
    return res.status(200).json(result);
  } catch (e) {
    return res.status(e.status || 500).json({
      message: e.message,
    });
  }
};

// Hàm cập nhật account
module.exports.updateAccount = async (req, res) => {
  try {
    const accountId = req.params.id;
    const data = req.body;

    if (!accountId) {
      return res.status(400).json({
        message: "The accountId is required",
      });
    }
    const result = await AccountService.updateAccount(accountId, data);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({
      message: e,
    });
  }
};

// Hàm chi tiết tài khoản
module.exports.detailAccount = async (req, res) => {
  try {
    const accountId = req.params.id;

    if (!accountId) {
      return res.status(400).json({
        message: "The accountId is required",
      });
    }
    const result = await AccountService.detailAccount(accountId);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({
      message: e,
    });
  }
};

// Hàm xóa
module.exports.deleteAccount = async (req, res) => {
  try {
    const accountId = req.params.id;
    const token = req.headers;
    if (!accountId) {
      return res.status(400).json({
        message: "The accountId is required",
      });
    }
    const result = await AccountService.deleteAccount(accountId);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({
      message: e,
    });
  }
};

module.exports.index = async (req, res) => {
  try {
    const result = await AccountService.index();
    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({
      message: e.message,
    });
  }
};

// Hàm lấy thông tin tài account đăng nhập
module.exports.getMe = async (req, res) => {
  try {
    const accountId = req.account.id;
    console.log('accountId',accountId)
    
    
    const result = await AccountService.getMe(accountId);
    return res.status(200).json(result);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
