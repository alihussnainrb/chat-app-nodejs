# Chat Web App

[Live Demo](https://chat-app.alihussnainrb.com/)

This project is a chat web application built with Node.js for the backend, Next.js for the client and Socket.IO for realtime messages.
Users can signup/signin, create channel.

**Channel Features**

1. Users can see and chat in their own channels and nearby channels in radius of 20km.
2. Users can see online users of current channel they are chatting in.
3. Users can see username of user who created channel.

**API Documentation:** [Postman API Endpoints](https://documenter.getpostman.com/view/12373135/2s9Ye8eufs)

## Folder Structure

The project has the following folder structure:

- `root/client`: Contains the Next.js client code.
- `root/server`: Holds the Node.js backend code.

## Setup

1. Run `npm install` in the `root/client` and `root/server` directories to install dependencies.
2. In the `root/server`, create a `.env` file and set the `DATABASE_URL` variable to your PostgreSQL database connection string.

   Example `.env` file in `root/server`:

   ```plaintext
   DATABASE_URL=your_postgresql_connection_string
   ```

3. Run `npm run migrate` in `root/server` to perform database migrations.

4. Set the `NEXT_PUBLIC_SERVER_BASE_URL` environment variable to the server's base URL. By default, it's `http://localhost:3000`.

## Development Mode

To start the application in development mode:

1. Run `npm run dev` separately in both `root/server` and `root/client`.

## Production Environment

To start the application in production environment:

1. Run `npm run build` in `root/client` to build the Next.js client.
2. After building the client, run `npm start` in `root/server` to start the server in production mode.

## Runtime Instructions

1. Location permission is mandatory
2. When creating new channel it automatically picks the location and fill `latitude,langitude` values, (for testing purpose fields can be edited to add custom `latitude,langitude`)
