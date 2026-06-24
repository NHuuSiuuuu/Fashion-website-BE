const express = require("express");
const dotenv = require("dotenv");
const { default: mongoose } = require("mongoose");
const routes = require("./routes/index.route");

// cors: tức là thằng fontend là backend khác port bẫn được gọi
const cors = require("cors");
// Cấu hình env
dotenv.config();

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();
const port = process.env.PORT || 3001;

// Sử dụng cors
app.use(
  cors({
    origin: process.env.CORS_ORIGINS.split(","),
    credentials: true,
  }),
);

app.use(cookieParser());

// Dùng thằng này để truy cập vào link ảnh: http://localhost:3001/uploads/filename.jpg
const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// Kết nối mongoose
const database = require("./config/database");
database.connectMongoose();
app.use(bodyParser.json());
routes(app);
app.listen(port, () => {
  console.log("Server running in port", port);
});
