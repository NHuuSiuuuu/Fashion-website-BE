const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

module.exports.uploadFile = async (req, res, next) => {
  if(!req.files || req.files.length == 0){
    return next()
  }
  const arrThumbnail = [];
  // console.log(req.files); // Trả về mảng obj
  for (const file of req.files) {
    const result = await new Promise((resolve, reject) => {
      let stream = cloudinary.uploader.upload_stream(
        { folder: "products" },
        (error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        }
      );

      streamifier.createReadStream(file.buffer).pipe(stream);
    });
    arrThumbnail.push(result); // push kq bào mảng
  }
  // console.log("arrrrrr", arrThumbnail);

  req.body.thumbnail = arrThumbnail.map((item) => item.secure_url);

  next();
};
