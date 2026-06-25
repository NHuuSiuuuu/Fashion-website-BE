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

const allowedOrigins = process.env.CORS_ORIGINS.split(",");

app.use(
  cors({
    origin: function (origin, callback) {
      // allow tools like Postman / server-to-server
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.replace(/\/$/, ""); // remove trailing slash

      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      console.log("CORS blocked origin:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);
// app.options("*", cors());
app.use(cookieParser());

// console.log
console.log("ORIGINS:", allowedOrigins);
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
