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
   ```
   );
   ```

4. **Environment Configuration**

   - Create a `.env` file in the root directory
   - Add your database configuration:

   ```env
   LOCALHOST=localhost
   ROOT=your_mysql_username
   APR-2023107177=your_mysql_password
   EXPLOREMOREPH=exploremoreph
   ```

5. **Start the application**

   ```bash
   node server.js
   ```

   The server will start on `http://localhost:3000` (or your configured port)

## 📁 Project Structure

```
ExploreMore-PH/
├── public/                    # Frontend files
│   ├── index.html            # Homepage
│   ├── aboutus.html          # About Us page
│   ├── budget.html           # Budget estimator
│   ├── promos.html           # Promotions page
│   ├── login.html            # User login
│   ├── signup.html           # User registration
│   ├── luzon.html            # Luzon destinations
│   ├── visayas.html          # Visayas destinations
│   ├── mindanao.html         # Mindanao destinations
│   ├── style.css             # Main stylesheet
│   ├── nav_footer.css        # Navigation styles
│   ├── script.js             # Main JavaScript
│   └── images/               # Image assets
│       ├── Luzon/            # Luzon destination images
│       ├── Visayas/          # Visayas destination images
│       └── Mindanao/         # Mindanao destination images
├── server.js                 # Express server
├── db.js                     # Database configuration
├── package.json              # Project dependencies
└── README.md                 # Project documentation
```

## 🎯 Usage

### For Travelers

1. **Browse Destinations**: Explore hidden gems by region (Luzon, Visayas, Mindanao)
2. **Plan Your Budget**: Use the budget estimator to calculate trip costs
3. **Find Deals**: Check out current promotions and discounts
4. **Create Account**: Sign up for personalized features and trip planning

### For Developers

1. **API Endpoints**:

   - `POST /signup` - User registration
   - `POST /login` - User authentication
   - `GET /` - Welcome endpoint

2. **Adding New Destinations**: Update the respective HTML files and add images to the appropriate regional folders

## 👥 Meet the Team

- **Julianna Boado** - Developer
- **Kyle Espinosa** - Developer
- **Renzo Falloran** - Developer
- **Nicko Baldo** - Developer

## 🎨 Design Features

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Image Carousels**: Beautiful showcases of destination photos
- **Interactive Maps**: Visual representation of the Philippines' regions
- **Modern UI**: Clean, intuitive interface with smooth animations
- **Accessibility**: Designed with accessibility best practices

## 🔒 Security

- Passwords are securely hashed using bcrypt
- Input validation and sanitization
- CORS configuration for secure cross-origin requests
- Environment variables for sensitive configuration

## 🤝 Contributing

We welcome contributions to ExploreMore PH! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Contribution Guidelines

- Follow the existing code style and structure
- Add appropriate comments for complex functionality
- Test your changes thoroughly
- Update documentation as needed

## 📝 License

This project is licensed under the ISC License. See the `package.json` file for details.

## 📞 Support & Feedback

Have questions, suggestions, or found a hidden gem we should feature? We'd love to hear from you!

- Use the feedback form on our About Us page
- Create an issue on GitHub
- Contact the development team

## 🌟 Future Enhancements

- [ ] Mobile app development
- [ ] Advanced search and filtering
- [ ] User reviews and ratings
- [ ] Trip planning tools
- [ ] Integration with booking platforms
- [ ] Multi-language support
- [ ] Offline map functionality

## 🔗 Links

- **Live Demo**: [Coming Soon]
- **GitHub Repository**: [https://github.com/your-username/ExploreMore-PH]

---

**© 2025 ExploreMore PH. All rights reserved.**

_Discover the Philippines like never before. Explore more, experience more, with ExploreMore PH._
