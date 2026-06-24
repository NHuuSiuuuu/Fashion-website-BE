/**
 * Stack trace là thông tin cho biết:
 * - Lỗi ở file nào
 * - Lỗi dòng nào
 * - Được gọi từ hàm nào
 * 
 *  Error.captureStackTrace(this, this.constructor): Thằng này để tạo stack trace chính xác hơn
 *  Bình thường Stack trace là:
 *  Error: Out of stock
     at new ApiError (ApiError.js:3) ======> Thằng này không cần thiết vì lỗi ở createAt, thêm thằng kia sẽ bỏ dòng này làm stack trace sạch hơn
     at createCart (cart.service.js:42)
 *
 */

class AppError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor); // giữ stack trace chính xác
  }
}

module.exports = AppError;
