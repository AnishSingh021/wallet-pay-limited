require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./src/models/User");

async function makeAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const email = "anishsingh10121@gmail.com";

    const user = await User.findOne({ email });

    if (!user) {
      console.log("User not found");
      return;
    }

    // Fix missing required field
    if (!user.displayName) {
      user.displayName = user.name || "Anish";
    }

    user.role = "admin";
    user.isApproved = true;
    user.isActive = true;
    user.rewardEligible = true;

    await user.save();

    console.log("✅ User updated successfully");
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

makeAdmin();