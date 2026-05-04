const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/novamoviess';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'youseffahmed74@proton.me';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@2024!';

const UserSchema = new mongoose.Schema({
  name: String, email: { type: String, unique: true }, password: String, role: { type: String, default: 'user' }
});

async function seed() {
  await mongoose.connect(MONGODB_URI);
  const User = mongoose.model('User', UserSchema);
  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await User.findOneAndUpdate(
    { email: ADMIN_EMAIL },
    { name: 'Admin', email: ADMIN_EMAIL, password: hashed, role: 'admin' },
    { upsert: true, new: true }
  );
  console.log(`Admin seeded: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  await mongoose.disconnect();
}
seed().catch(console.error);
