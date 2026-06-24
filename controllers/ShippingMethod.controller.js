const ShippingMethodService = require("../services/shipping_method.service");
module.exports.create = async (req, res) => {
  try {
    const result = await ShippingMethodService.create(req.body);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({ status: "ERROR", message: e.message });
  }
};

module.exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const result = await ShippingMethodService.update(id, data);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({ status: "ERROR", message: e.message });
  }
};

module.exports.delete = async (req, res) => {
  try {
    const id = req.params.id;

    const result = await ShippingMethodService.delete(id);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({ status: "ERROR", message: e.message });
  }
};

module.exports.index = async (req, res) => {
  try {
    const { limit, page, sort, filter } = req.query;
    // console.log('query:',typeof(filter));
    const result = await ShippingMethodService.index(
      Number(limit) || 5,
      Number(page) || 0,
      sort,
      filter,
    );
    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({
      message: e.message,
    });
  }
};
module.exports.detail = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await ShippingMethodService.detail(id);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({
      message: e.message,
    });
  }
};
