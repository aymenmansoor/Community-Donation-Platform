require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const User = require('./models/User');
const Donation = require('./models/Donation');
const requestRoutes = require('./routes/requestRoutes');

const app = express();

app.use(express.json());
app.use(cors());

// ===== DATABASE CONNECTION =====
const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/community_donation';

mongoose.connect(mongoURI)
  .then(() => console.log("✅ SUCCESS: MongoDB Connected to Compass!"))
  .catch(err => console.error("❌ ERROR: Database connect nahi ho saka!", err.message));

// ===== MULTER (Image Uploads) =====
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

app.use('/uploads', express.static(uploadDir));

// ===== AUTH ROUTES =====
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    if (!fullName || !email || !password) {
        return res.status(400).json({ message: "Sari fields bharna zaroori hain" });
    }

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "Email pehle se maujood hai" });

    // Password Hashing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ fullName, email, password: hashedPassword, role: role || 'Donor' });
    await user.save();

    return res.status(201).json({ message: "Signup successful! Ab login karein." });

  } catch (err) {
    console.error("Signup Error:", err);
    return res.status(500).json({ message: "Server Error: " + err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User nahi mila" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Ghalat password" });

    if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not configured');
}

const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    return res.json({ token, user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role } });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ===== DONATION & REQUEST ROUTES =====
app.post('/api/donate', upload.single('image'), async (req, res) => {
  try {
    const donation = new Donation({ ...req.body, image: req.file ? req.file.filename : null });
    await donation.save();
    res.json({ message: "Donation saved!" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get('/api/donations', async (req, res) => {
  const data = await Donation.find();
  res.json(data);
});

app.use('/api/requests', requestRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));