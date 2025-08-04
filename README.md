# AI Vehiql Commerce

AI Vehiql Commerce is a modern web application for car listings, featuring advanced filtering, an administrative panel, and user authentication.

## Features

- **Car Listings:** Browse a wide range of cars with detailed information.
- **Advanced Filtering:** Filter cars by make, body type, fuel type, transmission, and price range.
- **Search Functionality:** Search for cars by keywords.
- **User Authentication:** Secure sign-in and sign-up processes.
- **Admin Panel:** Manage car listings and other administrative tasks. (Requires authentication)

## Technologies Used

- **Next.js:** React framework for production.
- **React:** Frontend JavaScript library.
- **Prisma:** Next-generation ORM for Node.js and TypeScript.
- **Tailwind CSS:** A utility-first CSS framework.
- **Lucide React:** Icon library.
- **Clerk:** For user authentication.

## Setup

To set up the project locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/ai-vehiql-commerce.git
    cd ai-vehiql-commerce
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Environment Variables:**
    Create a `.env` file in the root directory and add the following environment variables:

    ```env
    DATABASE_URL="your_database_url_here"
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
    CLERK_SECRET_KEY="your_clerk_secret_key"
    ```
    Replace the placeholder values with your actual database URL and Clerk API keys.

4.  **Database Setup (Prisma):**
    Run Prisma migrations to set up your database schema:

    ```bash
    npx prisma migrate dev --name init
    ```

## Running the Application

To run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The application will automatically reload when you make changes.
