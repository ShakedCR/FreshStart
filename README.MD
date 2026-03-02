🌱 FreshStart

FreshStart is a full-stack social network built to support people who want to quit smoking.
The platform allows users to share their journey, track their progress, and connect with others going through the same process.

This project was developed as a final course project for a B.Sc. in Computer Science and demonstrates real-world full-stack development practices.

🎯 Project Overview

FreshStart was designed to simulate a production-ready application, including secure authentication, protected API routes, database integration, image uploads, AI-powered search, and live deployment.

The goal of the project is to create a safe and motivating online space for people who are trying to quit smoking.

🚀 Main Features

User registration & login (JWT + Refresh Token)

Google OAuth login

Create, edit, and delete posts

Image upload for posts

Like / Unlike functionality

Comments (add & delete)

User profile page with edit option

Personal quitting counter (days, hours, minutes)

AI-powered post search

Infinite scrolling feed

Automatic feed refresh

Secure backend authorization middleware

Production deployment with PM2

🛠 Tech Stack
Frontend

React

TypeScript

Vite

Material UI (MUI)

Backend

Node.js

Express

TypeScript

MongoDB (Atlas)

JWT Authentication

Refresh Token mechanism

Multer (file uploads)

Swagger API documentation

🔐 Authentication Architecture

The system uses:

Short-lived Access Tokens

Refresh Tokens for secure session renewal

Google OAuth integration

Protected backend routes with middleware

All sensitive endpoints require valid authentication.

🌍 Live Production

The project is deployed and accessible at:

https://node70.cs.colman.ac.il

Deployment is managed using PM2.

📘 API Documentation

Swagger documentation is available at:

/api-docs

💻 Running Locally
1. Clone the repository

git clone <your-repository-url>
cd FreshStart

2. Install dependencies

Client:
cd client
npm install

Server:
cd server
npm install

3. Environment Variables

Create .env files for both client and server.

Server example:

PORT=
MONGO_URI=
JWT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

Client example:

VITE_API_URL=http://localhost:3000

4. Run the project

Server:
npm run dev

Client:
npm run dev

📚 Academic Context

This project was developed as part of a full-stack web development course.

It demonstrates:

REST API design

Secure authentication flow

Database modeling

File upload handling

Frontend–backend integration

Environment separation (development & production)

Live deployment to a remote server

The goal was not only to meet course requirements, but to build a system that reflects real-world development practices.

👩‍💻 Author

Shaked Crissy
B.Sc. Computer Science Student
Final Course Project