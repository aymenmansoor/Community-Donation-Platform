// Runs only when the MongoDB data volume is first initialized.
const database = db.getSiblingDB('community_donation');
database.createUser({ user: process.env.MONGO_APP_USER, pwd: process.env.MONGO_APP_PASSWORD, roles: [{ role: 'readWrite', db: 'community_donation' }] });
