# Chat Web App

[https://chat-app.alihussnainrb.com](https://chat-app.alihussnainrb.com/)

This project is a chat web application built with Node.js for the backend and Next.js for the client.
Users can signup/signin, create channel,see and chat in nearby channels (nearby in radius of 20km).

**API Documentation:** [Postman API Endpoints](https://documenter.getpostman.com/view/12373135/2s9Ye8eufs)

## Folder Structure

The project has the following folder structure:

- `root/client`: Contains the Next.js client code.
- `root/server`: Holds the Node.js backend code.

## Setup

1. Run `npm install` in the root directory to install dependencies for both the client and server.
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
