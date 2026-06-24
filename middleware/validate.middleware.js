/**
 * Middleware này sẽ:
 * - Nhận schema
 * validate req.body
 * nếu sai => trả lỗi
 * nếu đúng => next()
 */

module.exports = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        // message: error.details.map((e) => e.message).join(", "),
        message: error.details[0].message,
      });
    }
    next();
  };
};
