const ProductModel = require("../models/product.model");

const API_KEY = process.env.GEMINI_API_KEY;
exports.chatBot = async (req, res) => {
  try {
    const { messages } = req.body;
    const products = await ProductModel.find()
      .select("slug title price sizes")
      .lean();

    const productsWithLink = products.map((prev) => ({
      ...prev,
      link: `/products/${prev.slug}`,
    }));
    const productList = JSON.stringify(productsWithLink, null, 2); // tham số thứ 2 là replacer: lọc lấy ra trường nào đấy ["name"] - số 2 là khoảng cách space
    console.log("messages", messages);

    if (!messages || messages.length === 0) {
      return res
        .status(400)
        .json({ message: "Không có tin nhắn nào gửi lên!" });
    }

    const contents = messages.map((msg) => ({
      role: msg.from === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    }));
    contents.unshift({
      role: "model",
      parts: [
        {
          text: `Bạn là chatbot hỗ trợ khách hàng của NHuu Boutique – cửa hàng thời trang trực tuyến.  
                Nhiệm vụ của bạn là tư vấn sản phẩm, hướng dẫn mua hàng, và giải đáp thắc mắc của khách.  
                Dưới đây là dữ liệu sản phẩm ở dạng JSON. Hãy sử dụng đúng dữ liệu này để trả lời khách:  
                ${productList}  
                Yêu cầu khi trả lời:  
                1. Luôn nhắc đến **tên sản phẩm** và **giá bán**.  
                2. Khi gợi ý sản phẩm, trả lời theo format rõ ràng, thân thiện, dễ click:  
                - Tên sản phẩm (giá)  
                👉 [Xem chi tiết](link)  <Link to={"/products/${product.slug}"}>
  Xem chi tiết
</Link>
                3. Luôn cung cấp link đúng để khách hàng bấm vào xem chi tiết sản phẩm trên website.  
                4. Không bao giờ trả về link thô.  
                5. Trả lời ngắn gọn, tự nhiên, giống hội thoại chat nhưng vẫn đảm bảo có từ khóa liên quan đến sản phẩm và Huan Store.  
                6. Không được tự ý thêm link ngoài luồng.   
`,
        },
      ],
    });
    // console.log("contents", contents[0]);

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": API_KEY,
        },
        body: JSON.stringify({ contents }),
      },
    );
    const data = await response.json();
    // console.log(data);
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) {
      return res.status(500).json({
        reply: "Gemini không trả lời, hãy kiểm tra lại API key hoặc quota.",
      });
    }

    res.json({ reply });
  } catch (err) {
    if (err.code === 429) {
      console.log("Đang bị rate limit, thử lại sau vài giây");
    }
    // console.log("Lỗi:" + err);
  }
};
