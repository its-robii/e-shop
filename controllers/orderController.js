const orderSchema = require("../models/orderSchema");
const productSchema = require("../models/productSchema");

const addNewOrder = async (req, res) => {
  const { items, shippingAddress, phone } = req.body;

  if (!items || items.length < 1)
    return res.status(400).send("Product is required");
  if (!shippingAddress) return res.status(400).send("Address is required");
  if (!phone) return res.status(400).send("Phone number is required");

  let totalAmount = 0;
  const populatedItems = [];

  for (const item of items) {
    const product = await productSchema.findById(item.productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    let itemPrice = product.price;

    item.selectedVariants.forEach((variant) => {
      const productVariant = product.varients.find(
        (v) => v.name === variant.name
      );
      if (productVariant) {
        const matchedOption = productVariant.options.find((opt) => {
          return opt.size === variant.option;
        });
        if (matchedOption) {
          itemPrice += matchedOption.additionalPrice;
          item.price = itemPrice;
        }
      }
    });
    totalAmount += itemPrice * item.quantity;
  }
  const order = new orderSchema({
    orderItems: items,
    user: req.user._id,
    shippingAddress,
    totalPrice: totalAmount,
  });

  const createdOrder = await order.save();
  res.status(201).json(createdOrder);
};

module.exports = { addNewOrder };     
