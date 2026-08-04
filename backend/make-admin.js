const mongoose = require('mongoose');

// Need to load env if needed, but assuming standard local db for now.
// Or we can just connect to 'mongodb://127.0.0.1:27017/walletpay'
require('dotenv').config({ path: './.env' });

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/walletpay')
  .then(async () => {
    const User = require('./src/models/User');
    const users = await User.find({}, 'email role');
    console.log('Users in DB:', users);
    
    const result = await User.updateMany(
      { email: { $in: ['nabanitabarman2006@gmail.com', 'deepaksiwag6@gmail.com'] } },
      { role: 'admin' }
    );
    console.log('Admins updated:', result);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
