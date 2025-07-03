# ExploreMore PH 🇵🇭

[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-00000F?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white)](https://getbootstrap.com/)

## 🛠️ Tech Stack

### Frontend

- **HTML5** - Semantic markup and structure
- **CSS3** - Advanced styling with Flexbox and Grid
- **Bootstrap 5** - Responsive design framework
- **JavaScript (ES6+)** - Interactive functionality and DOM manipulation
- **SVG Graphics** - Interactive Philippines map
- **Google Fonts** - Typography (Cardo & Source Sans Pro)

### Backend

- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **Express Session** - Session management
- **Express Validator** - Input validation and sanitization

### Database

- **MySQL 2** - Relational database management
- **Connection Pooling** - Optimized database connections

### Security & Utilities

- **bcrypt** - Password hashing and security
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management
- **Body Parser** - Request parsing middleware

## 📋 Prerequisites

Before running this project, ensure you have:

- **[Node.js](https://nodejs.org/)** (v14 or higher)
- **[MySQL](https://www.mysql.com/)** (v5.7 or higher)
- **[Git](https://git-scm.com/)** for version control
- A modern web browser (Chrome, Firefox, Safari, Edge)

## ⚙️ Installation & Setup

### 1. **Clone the Repository**

```bash
git clone https://github.com/your-username/ExploreMore-PH.git
cd ExploreMore-PH
```

### 2. **Install Dependencies**

```bash
npm install
```

**Dependencies included:**

- express
- express-session
- express-validator
- cors
- dotenv
- mysql2
- bcrypt
- body-parser

### 3. **Database Setup**

#### Create MySQL Database

```sql
CREATE DATABASE exploremoreph;
USE exploremoreph;
```

#### Run Database Schema

**Database includes:**

- `users` table - User authentication and management
- `feedback` table - User feedback and reviews
- Proper indexing for optimized performance
- Foreign key relationships for data integrity

```sql
   CREATE TABLE users (
     id INT AUTO_INCREMENT PRIMARY KEY,
     fullname VARCHAR(255) NOT NULL,
     email VARCHAR(255) UNIQUE NOT NULL,
     password_hash VARCHAR(255) NOT NULL,
     role VARCHAR(50) NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

### 4. **Environment Configuration**

Create a `.env` file in the root directory:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=exploremoreph

# Session Configuration (Optional)
SESSION_SECRET=your-session-secret-key

# Server Configuration (Optional)
PORT=3000
```

### 5. **Start the Application**

#### Development Mode

```bash
npm run dev
```

#### Production Mode

```bash
npm start
```

The server will start on `http://localhost:3000`

## 🔧 API Endpoints

### Authentication

- `POST /signup` - User registration with validation
- `POST /login` - User authentication and session creation
- `POST /logout` - Session termination

### Content

- `GET /` - Homepage with interactive map
- `GET /luzon` - Luzon regional guide
- `GET /visayas` - Visayas regional guide
- `GET /mindanao` - Mindanao regional guide
- `GET /budget` - Budget planning tools
- `GET /promos` - Promotions and deals

### User Features

- `POST /feedback` - Submit user feedback
- `GET /aboutus` - About page and team information

## 📁 Project Structure

```
ExploreMore-PH/
├── 📁 config/
│   └── db.js                 # Database configuration
├── 📁 models/
│   └── database_schema.sql   # Database schema
├── 📁 public/               # Frontend assets
│   ├── 📁 images/           # Image assets by region
│   │   ├── 📁 Luzon/
│   │   ├── 📁 Visayas/
│   │   └── 📁 Mindanao/
│   ├── index.html           # Homepage with interactive map
│   ├── luzon.html           # Luzon tourist spots
│   ├── visayas.html         # Visayas tourist spots
│   ├── mindanao.html        # Mindanao tourist spots
│   ├── budget.html          # Budget planning page
│   ├── promos.html          # Promotions page
│   ├── aboutus.html         # About us page
│   ├── login.html           # Login page
│   ├── signup.html          # Registration page
│   └── 📁 CSS & JS files
├── server.js                # Main server file
├── package.json             # Dependencies and scripts
├── .env                     # Environment variables
└── README.md               # This file
```

**© 2025 ExploreMore PH. All rights reserved.**
