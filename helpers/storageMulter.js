const multer = require("multer");

module.exports = () => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/uploads/");
    },
    filename: function (req, file, cb) {
      // filename: Tên file
      const uniqueSuffix = Date.now();
      cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
  });
  return storage;
};
