# ExploreMore PH 🇵🇭
## Tech Stack

### Frontend

- **HTML5** - Structure and markup
- **CSS3** - Styling and responsive design
- **Bootstrap 5** - UI components and responsive grid
- **JavaScript** - Interactive functionality
- **Google Fonts** - Typography (Cardo & Source Sans Pro)

### Backend

- **Node.js** - Server runtime
- **Express.js** - Web application framework
- **MySQL** - Database management
- **bcrypt** - Password hashing and security
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [MySQL](https://www.mysql.com/) (v5.7 or higher)
- [Git](https://git-scm.com/)

## ⚙️ Installation & Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/ExploreMore-PH.git
   cd ExploreMore-PH
   ```

2. **Install dependencies**

   ```bash
   npm install express express-session express-validator cors dotenv mysql2
   ```


3. **Database Setup**

   - Ensure you have a MySQL server running (v5.7 or higher).
   - This project uses the [`mysql2`](https://www.npmjs.com/package/mysql2) package as the recommended Node.js client for connecting to MySQL databases.
   - Create a MySQL database named `exploremoreph`
   - Create a `users` table with the following structure:

   ```sql
   CREATE TABLE users (
     id INT AUTO_INCREMENT PRIMARY KEY,
     fullname VARCHAR(255) NOT NULL,
     email VARCHAR(255) UNIQUE NOT NULL,
     password_hash VARCHAR(255) NOT NULL,
     role VARCHAR(50) NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

4. **Environment Configuration**

   - Create a `.env` file in the root directory
   - Add your database configuration:

   ```env
   DB_HOST=localhost
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=exploremoreph
   ```

5. **Start the application**

   ```bash
   npm start
   ```

   The server will start on `http://localhost:3000` (or your configured port)

### For Developers

1. **API Endpoints**:

   - `POST /signup` - User registration
   - `POST /login` - User authentication
   - `GET /` - Welcome endpoint


**© 2025 ExploreMore PH. All rights reserved.**
