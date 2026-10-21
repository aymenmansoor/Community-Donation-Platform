# Community Donation Platform 🤝

### Connecting people who have items to give with people who need them

**Community Donation Platform** is a full-stack web application for sharing reusable items within a community. Donors can post available items, and requesters can browse listings and submit requests for the things they need.

Built with **React, Node.js, Express, and MongoDB**.

---

## ✨ Features

- **Donor and requester accounts** — Register and sign in with a selected account role.
- **Donation listings** — Post items with a title, description, category, contact number, and optional image.
- **Browse available items** — Explore donation cards with images and item details.
- **Request an item** — Submit a request with a short explanation of why the item is needed.
- **Track requests** — Review submitted requests and their pending, approved, or rejected status.
- **Donor views** — See donations associated with your account and requests received for donated items.
- **Request status management** — Backend endpoints support approving or rejecting requests.
- **Responsive interface** — React components with Bootstrap-based styling.

## 🛠 Tech stack

| Layer | Technologies |
| --- | --- |
| Frontend | React, React Router, Axios |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcryptjs |
| Image uploads | Multer |
| Styling | CSS, Bootstrap-based UI |

## 🔄 How it works

1. **Sign up** as a Donor or Requester.
2. **Donors** post available items, including an item description and image.
3. **Requesters** browse donated items and submit requests.
4. **Donors** review incoming requests and their statuses.
5. **Requesters** follow the progress of their submitted requests.

## 📸 Screenshots

Application screenshots can be added here once captured from the running project. Recommended views include the home page, donation form, available items, request form, and request history.

## 🚀 Getting started

### Prerequisites

- Node.js and npm
- MongoDB running locally or a MongoDB connection string

### 1. Clone the repository

```bash
git clone https://github.com/aymenmansoor/Community-Donation-Platform.git
cd Community-Donation-Platform
```

### 2. Configure and start the backend

```bash
cd backend
npm install
```

Create a `backend/.env` file containing values for your own environment:

```dotenv
MONGO_URI=mongodb://127.0.0.1:27017/community_donation
JWT_SECRET=replace-with-a-long-random-secret
PORT=5000
```

Start the backend:

```bash
node server.js
```

The API runs at `http://localhost:5000` by default.

### 3. Start the frontend

Open another terminal from the repository root:

```bash
cd frontend
npm install
npm start
```

Open `http://localhost:3000` in your browser.

The current frontend sends requests to `http://localhost:5000`, so keep the backend running on that port when testing locally.

## 📁 Project structure

```text
Community-Donation-Platform/
├── backend/
│   ├── models/          MongoDB models for users, donations, and requests
│   ├── routes/          Request API routes
│   ├── uploads/         Locally stored uploaded item images
│   └── server.js        Express API and MongoDB connection
├── frontend/
│   ├── public/          Frontend public assets
│   └── src/
│       ├── components/  Forms, navigation, authentication, and profile views
│       └── pages/       Item browsing and request-management views
├── index.html
├── style.css
└── README.md
```

## 🧩 Application modules

**Frontend:** Role-aware navigation, account registration and sign-in, donation creation, available-item browsing, profiles, and request tracking.

**Backend:** Express REST endpoints for authentication, donations, item retrieval, and donation requests, backed by MongoDB.

---

*Community Donation Platform is a web development project focused on making item donation and community sharing more accessible.*
