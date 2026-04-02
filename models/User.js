const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long."],
      maxlength: [100, "Name cannot exceed 100 characters."]
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address."]
    },
    password: {
      type: String,
      required: [true, "Password is required."],
      minlength: [6, "Password must be at least 6 characters long."],
      select: false
    },
    role: {
      type: String,
      enum: ["admin", "analyst", "viewer"],
      default: "viewer"
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// ========Password Hash Hook========
userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) {
    return next();
  }

  const saltRounds = 10;
  this.password = await bcrypt.hash(this.password, saltRounds);
  return next();
});

// ========Password Compare Method========
userSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
