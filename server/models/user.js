const mongoose = require("mongoose");

mongoose.set("useCreateIndex", true);
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: "Please provide username",
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    required: "Please provide an email"
  },
  password: {
    type: String,
    required: true
  },
  registered: {
    type: Date,
    default: Date.now
  },
  resetToken: String,
  resetTokenExpires: Date
});

userSchema.methods.addToCart = function(product) {
  const cartProductIndex = this.cart.items.findIndex(cp => {
    return cp.productId.toString() === product._id.toString();
  });
  let newQuantity = 1;
  const updatedCartItems = [...this.cart.items];

  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity
    });
  }
  const updatedCart = {
    items: updatedCartItems
  };
  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.removeFromCart = function(productId) {
  const updatedCartItems = this.cart.items.filter(item => {
    return item.productId.toString() !== productId.toString();
  });
  this.cart.items = updatedCartItems;
  return this.save();
};

userSchema.methods.clearCart = function() {
  this.cart = { items: [] };
  return this.save();
};

module.exports = mongoose.model("User", userSchema);
