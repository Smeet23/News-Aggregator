# 🗞️ News Aggregator

A full-stack modern News Aggregator platform where users can read, post, comment, and vote on news stories. Built using **Node.js**, **Express**, **MongoDB**, and **EJS**, this app features a complete authentication system, notifications, a ranking algorithm, content moderation, and automatic news fetching using public news APIs.

## 🚀 Features

- 🧑‍💻 **Authentication System**
  - Signup, login, logout with secure JWT sessions
  - Password hashing using bcrypt
  - Password reset via Brevo SMTP integration

- 📰 **News Feed**
  - Users can post news with title, content, and link
  - Posts are ranked using upvotes and timestamps
  - View top and latest news

- 🤖 **Automated News Fetching**
  - Integration with public News APIs (like NewsAPI or GNews)
  - Scheduled fetching of news every 2 hours via `node-cron`
  - Auto-posts relevant news into platform feed with proper formatting
  - Auto-creates special system news accounts for attribution

- 💬 **Engagement**
  - Nested comments with threaded structure
  - Upvote/downvote system for both posts and comments
  - Notifications in Email and in app

- 🛡️ **Moderation Tools(Working)**
  - Report system for inappropriate content
  - Admin moderation dashboard

- 🧑‍🎨 **User Profile**
  - View user details and post history
  - Edit bio and social links

- ⚙️ **Settings Page**
  -  Upload profile picture
  - Notification preferences
  - Account deletion

## 🧰 Tech Stack

| Layer         | Technology                       |
| ------------- | -------------------------------- |
| Backend       | Node.js, Express.js              |
| Database      | MongoDB, Mongoose                |
| Frontend      | EJS, Bootstrap                   |
| Auth & Hash   | JWT, bcrypt                      |
| Email Service | Brevo SMTP                       |
| Scheduler     | node-cron                        |
| News API      | NewsAPI.org or GNews API         |

## 🖥️ Project Structure

```
news-aggregator/
├── controllers/         # Route controllers
├── models/              # Mongoose models (User, Post, Comment, Report)
├── routes/              # Route definitions
├── views/               # EJS templates
├── public/              # Static assets (CSS, JS)
├── services/            # Core logic (news scheduler, moderation)
├── scheduler/           # News fetch & post automation (cron jobs)
├── utils/               # Helper utilities
└── app.js               # Main server entry
```

## ⚡ Installation

### Prerequisites

- Node.js v16+
- MongoDB (local or Atlas)
- Brevo (Sendinblue) SMTP credentials
- News API Key (from https://newsapi.org or https://gnews.io)

### Setup

```bash
git clone https://github.com/Smeet23/News-Aggregator.git
cd News-Aggregator
npm install
```

### Configure Environment Variables

Create a `.env` file in the root directory and add the following:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
SMTP_USER=your_brevo_smtp_email
SMTP_PASS=your_brevo_smtp_password
NEWS_API_KEY=your_news_api_key
```

### Run the App

```bash
npm run dev
```

Visit the app at: [http://localhost:3000](http://localhost:3000)

### Start News Fetch Scheduler

The news fetch runs every 2 hours automatically via `node-cron`.  
You can find the scheduler here:

```js
// scheduler/newsScheduler.js
cron.schedule('0 */2 * * *', async () => {
  await fetchAndPostNews();
});
```

## 🧪 Demo Credentials (Optional)

| Role   | Email              | Password  |
|--------|--------------------|-----------|
| Admin  | admin@example.com  | admin123  |
| User   | user@example.com   | user123   |

> You can add demo users manually via MongoDB Compass or a seeder script.

## ✨ Upcoming Features

- 🔍 Full-text search across news posts
- 📅 Scheduled newsletter emails
- 📊 Admin analytics dashboard
- 🌐 Internationalization (i18n) support


## 👨‍💻 Author

**Smeet Agrawal**

- 🌐 [Portfolio](https://smeet-portfolio-tan.vercel.app)
- 💼 [LinkedIn](https://www.linkedin.com/in/sagrawal237/)
- 📧 Email: smeetagrawal23@gmail.com

## 🤝 Contributing

Contributions are welcome!

```bash
# Fork the repository
git checkout -b feature/my-feature
git commit -m "Add amazing feature"
git push origin feature/my-feature
```

Submit a Pull Request and I’ll review it.

## 📜 License

This project is licensed under the [MIT License](LICENSE).

---
