# The Wandering Desk API

The Wandering Desk API is a RESTful backend service that powers The Wandering Desk web application. It allows users to create and manage workspace collections, upload images, visualise locations on interactive maps, and access live weather information.

## Features

* JWT authentication and protected API routes
* Secure password hashing with bcrypt
* Create, edit, and delete workspace collections
* Create, edit, and delete workspaces
* Interactive weather-based map layers using Leaflet
* OpenWeather API integration
* Firebase image upload support
* Analytics support for SvelteKit dashboard visualisations
* User-specific collections and session management
* RESTful API architecture

## Technologies Used

### Backend

* Node.js
* Hapi.js
* MongoDB Atlas
* Mongoose
* JWT Authentication
* Joi Validation
* bcrypt

### External Services

* OpenWeather API
* Firebase Storage
* Render (deployment)

## Live API

https://your-render-api-url.onrender.com

## Installation

### Clone the repository

```bash
git clone https://github.com/edabelt/thewanderingdesk-api.git
cd thewanderingdesk-api
```

### Install dependencies

```bash
npm install
```

### Configure environment variables

Create a `.env` file in the root directory:

```env
cookie_name=thewanderingdesk_cookie
cookie_password=your_secret_password
db=your_mongodb_connection_string
PORT=3000
```

### Start the server

```bash
npm start
```

The API will run on:

```txt
http://localhost:3000
```
