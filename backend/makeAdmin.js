require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function makeAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // We will update both emails just in case
    const emails = ['anishsingh10121@gmail.com', 'anish@gmail.com'];
    
    for (const email of emails) {
      const user = await User.findOne({ email });
      if (user) {
        user.role = 'admin';
        user.isApproved = true;
        user.isActive = true;
        await user.save({ validateBeforeSave: false });
        console.log(`Successfully approved and made ${email} an admin.`);
      } else {
        console.log(`User ${email} not found in DB.`);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

makeAdmin();