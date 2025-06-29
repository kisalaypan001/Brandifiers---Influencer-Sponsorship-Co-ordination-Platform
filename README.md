# 🚀 Brandifiers - Influencer Sponsorship Coordination Platform - V2

![Project Banner](https://img.shields.io/badge/Project-Brandifiers-blueviolet?style=for-the-badge)  
*An integrated platform for managing influencer sponsorship campaigns*

---

## 👨‍💻 Author:

**Kisalay Pan**  
📧 Email: [kisalay.pan003@gmail.com](mailto:kisalay.pan003@gmail.com)

---

## 📌 Project Summary:

**Brandifiers** is a web-based platform that enables brands to **coordinate**, **manage**, and **analyze influencer sponsorship campaigns** with ease. It offers **multi-role access** for Admins, Influencers, and Advertisers with integrated tools for campaign management, performance tracking, and real-time analytics.

---

## 🎯 Objectives:

- Automate and streamline the influencer sponsorship process.
- Provide **secure**, **role-based access control** for different user types.
- Track **campaign performance**, **ad requests**, and **engagement metrics**.

---

## 🛠️ Technology Stack:

| Layer        | Technology                                   |
|------------- |--------------------------------------------|
| **Backend**  | Flask, Flask-SQLAlchemy, Flask-Migrate, Flask-JWT-Extended, Celery |
| **Frontend** | Vue.js, Bootstrap |
| **Database** | SQLite |
| **Tools**    | Redis (for caching and Celery queues), PowerShell for Windows VM deployment |
| **Deployment** | Linux Virtual Machine |

---

## 🗃️ Database Models:

- **Influencer Model:** Social media details, audience metrics, campaign links.
- **Admin Model:** Full system control - user, campaign, and ad management.
- **AdRequest Model:** Tracks ad requests (pending, accepted, completed).
- **Campaign Model:** Links between influencers and advertisers, ad content, status.
- **Statistics Model:** Stores performance metrics like views, engagement rate, ROI.

---

## ✨ Key Features:

- 🔐 **Role-Based Access Control**  
  → JWT-secured authentication with three roles: Admin, Influencer, Advertiser.

- 📢 **Campaign Management**  
  → Admins manage campaigns and influencer assignments.

- 📋 **Ad Request System**  
  → Advertisers submit and track ad requests.

- 📈 **Performance Analytics**  
  → Real-time statistics on campaign performance (views, likes, ROI).

- ⚙️ **Asynchronous Task Handling with Celery**  
  → Background tasks like notifications, report generation, and data processing.

---

## 🧑‍💻 Development Process:

1. **Initial Setup:**  
   - Virtual environment creation  
   - Flask and Celery setup  
   - Database models with Flask-SQLAlchemy  

2. **Feature Implementation:**  
   - API routes for each user role  
   - Celery-Redis integration  
   - Vue.js frontend for dynamic views  

3. **Testing:**  
   - JWT-based role validation  
   - Campaign and ad request workflows  
   - Performance metrics accuracy  

---

## 🛠️ Challenges Faced & Solutions:

| Challenge                     | Solution                          |
|------------------------------ |---------------------------------- |
| Celery task queue management  | Proper Redis & Celery configuration |
| Role-based routing conflicts  | Improved JWT role parsing and authorization checks |
| Slow database queries          | Optimized SQL queries and added indexes |

---

## ✅ Project Outcomes:

- A fully functional **Influencer Sponsorship Management Platform**
- Smooth **multi-role access**
- Real-time **analytics dashboard**
- Scalable and modular backend design

---

## 🚀 Future Enhancements:

- 💳 **Payment Gateway Integration**
- 📊 **Advanced Reporting Tools**
- 🤖 **AI-based Influencer Recommendations**

---

## 🎥 Project Presentation:

- 📺 **YouTube Demo:** [Link Here](https://youtu.be/st5e10Ko9ZI)  
- 📂 **Drive Folder:** [Link Here](https://drive.google.com/file/d/1P_afzhdtQ2WKKB08L-sPjc2R19-W9xuu/view?usp=drive_link)

---

## 🌟 Thank you for visiting this project!  
*Feel free to fork, star ⭐, or contribute!*

