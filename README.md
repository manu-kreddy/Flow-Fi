# Flow-Fi
# FlowFi — Smart Debt & EMI Management Platform

<p align="center">
  <b>AI-Powered Financial Intelligence Platform for Smart Debt Management</b>
</p>

---

## 📌 Overview

FlowFi is an AI-powered personal finance management platform designed to help users track debts, manage EMIs, optimize repayment strategies, and improve financial decision-making.

The platform provides users with a centralized view of their financial obligations and helps them create smarter repayment plans using financial strategies like **Debt Snowball** and **Debt Avalanche**.

FlowFi aims to reduce financial stress by combining:

- Debt tracking
- EMI management
- Repayment optimization
- Financial insights
- AI-powered assistance

---

## 🎯 Problem Statement

Managing multiple loans, EMIs, and financial commitments can become difficult due to:

- Lack of structured debt tracking
- Missed payment deadlines
- Increasing interest burden
- Poor repayment planning
- Lack of personalized financial guidance

Existing solutions often focus only on expense tracking and do not provide intelligent debt repayment assistance.

---

## 💡 Solution

FlowFi provides an intelligent financial management system that allows users to:

- Track all loans and EMIs in one place
- Monitor repayment progress
- Compare repayment strategies
- Simulate repayment scenarios
- Receive AI-based financial suggestions

---

# 🚀 Features

## 🔐 Authentication

- Secure user registration and login
- JWT-based authentication
- Protected routes
- User-specific financial data

---

## 💳 Debt Ledger

Manage all debts in one place.

Features:

- Add loans
- Track remaining balance
- View EMI details
- Monitor interest rates
- Update/delete debt records

---

## 📊 Financial Dashboard

Provides a financial overview including:

- Total outstanding debt
- Monthly EMI commitments
- Loan count
- Repayment progress
- Financial insights

---

## 🎯 Payoff Strategist

Helps users choose effective repayment strategies.

### Debt Snowball Method

Prioritizes:

> Smallest debt first

Benefits:

- Faster motivation
- Quick wins
- Psychological advantage


### Debt Avalanche Method

Prioritizes:

> Highest interest debt first

Benefits:

- Reduces total interest
- Saves money long term

---

## 📈 Impact Simulator

Allows users to understand the effect of additional payments.

Users can simulate:

- Extra monthly payments
- Faster repayment
- Interest savings

---

## 🤖 AI Financial Advisor

Provides personalized financial guidance.

Capabilities:

- Debt analysis
- Repayment suggestions
- Financial insights
- Smart recommendations

---

# 🏗️ System Architecture

```
                 User
                  |
                  |
            React Frontend
                  |
                  |
             REST APIs
                  |
                  |
          Spring Boot Backend
                  |
        ---------------------
        |                   |
     MongoDB          AI Layer
                       |
                 OpenAI API
```

---

# 🛠️ Tech Stack

## Frontend

- React.js
- Vite
- JavaScript
- CSS
- Axios

## Backend

- Java
- Spring Boot
- Spring Security
- JWT Authentication

## Database

- MongoDB

## AI Integration

- OpenAI API

---

# 📂 Project Structure

```
FlowFi/

│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── package.json
│
├── backend/
│   ├── src/main/java/
│   ├── controllers/
│   ├── services/
│   ├── models/
│   └── pom.xml
│
└── README.md
```

---

# ⚙️ Installation & Setup

## Prerequisites

Install:

- Node.js
- Java 17+
- Maven
- MongoDB


---

## Clone Repository

```bash
git clone https://github.com/yourusername/flowfi.git

cd flowfi
```

---

# Backend Setup

Navigate:

```bash
cd backend
```

Build:

```bash
mvn clean install
```

Run:

```bash
mvn spring-boot:run
```

Backend runs on:

```
http://localhost:8080
```

---

# Frontend Setup

Navigate:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start:

```bash
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

# Database Configuration

Create MongoDB database:

```
flowfi
```

Update configuration:

```
application.yml
```

Example:

```yaml
spring:
  data:
    mongodb:
      uri: mongodb://localhost:27017/flowfi
```

---

# 🔒 Security

FlowFi uses:

- JWT authentication
- Protected APIs
- User-specific data access
- Secure backend validation

---

# 🔮 Future Enhancements

Planned improvements:

- Advanced ML-based financial prediction
- AI autonomous finance agent
- Credit score analysis
- Bank API integration
- Mobile application
- Voice-based financial assistant

---

# 👥 Team

Developed by:

**Hustle Riders**

Hackfiniti 2026

---

# 📜 License

This project is developed for educational and research purposes.
