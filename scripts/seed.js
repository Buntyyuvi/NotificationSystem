const mongoose = require('mongoose');

async function seed() {
  await mongoose.connect('mongodb://admin:password@localhost:27017/notifications?authSource=admin');
  
  const User = mongoose.model('User', new mongoose.Schema({
    userId: String,
    email: String,
    phone: String,
    devices: [{ token: String, platform: String }],
    preferences: [{ channel: String, enabled: Boolean, digestMode: Boolean }]
  }));

  await User.deleteOne({ userId: 'user-1' });
  
  await User.create({
    userId: 'user-1',
    email: 'user1@example.com',
    phone: '+1234567890',
    devices: [
      { token: 'fake-fcm-token-123', platform: 'android' },
      { token: 'fake-apns-token-456', platform: 'ios' }
    ],
    preferences: [
      { channel: 'websocket', enabled: true, digestMode: false },
      { channel: 'push', enabled: true, digestMode: false },
      { channel: 'email', enabled: true, digestMode: false },
      { channel: 'sms', enabled: false, digestMode: false }
    ]
  });

  console.log('✅ User seeded');
  await mongoose.disconnect();
}

seed().catch(console.error);