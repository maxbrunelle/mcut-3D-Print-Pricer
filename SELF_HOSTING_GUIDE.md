# Self-Hosting Your 3D Print Pricer Database

This application currently uses `localStorage` for offline persistence, with built-in functionality available to extend to Firebase or Cloud SQL. However, if you want to self-host the database entirely on your own hardware (e.g., a personal server, NAS, or Raspberry Pi) using open-source tools like PostgreSQL or MongoDB, follow this comprehensive guide.

## Recommended Tech Stack

For self-hosting, we recommend:
1.  **Database**: **PostgreSQL** (Robust, relational, highly supported)
2.  **Backend API**: **Node.js with Express** (Matches the frontend language)
3.  **ORM (Object-Relational Mapping)**: **Prisma** or **Drizzle** (For easy database interactions)
4.  **Deployment**: **Docker & Docker Compose** (For easy self-hosting and updates)

---

## Step 1: Set Up Your Server Environment

You will need a machine (Linux, macOS, or Windows) with **Docker** and **Docker Compose** installed.

1.  Install Docker: [https://docs.docker.com/get-docker/](https://docs.docker.com/get-docker/)
2.  Create a new folder on your server for the app deployment:
    ```bash
    mkdir 3d-print-pricer-host
    cd 3d-print-pricer-host
    ```

## Step 2: Create the Database with Docker

Create a `docker-compose.yml` file to spin up a PostgreSQL instance automatically:

```yaml
version: '3.8'
services:
  db:
    image: postgres:15-alpine
    restart: always
    environment:
      POSTGRES_USER: pricer_admin
      POSTGRES_PASSWORD: your_secure_password
      POSTGRES_DB: pricer_db
    ports:
      - "5432:5432"
    volumes:
      - db_data:/var/lib/postgresql/data

volumes:
  db_data:
```

Run the database in the background:
```bash
docker-compose up -d
```

## Step 3: Implement the Backend API

Instead of the frontend saving to `localStorage`, you need a backend to talk to the database.

1. Initialize a new Node project in a `server` folder:
   ```bash
   mkdir server && cd server
   npm init -y
   npm install express cors dotenv pg
   npm install prisma --save-dev
   ```

2. Initialize Prisma for database schema management:
   ```bash
   npx prisma init
   ```

3. Update the `.env` file in the `server` folder:
   ```env
   DATABASE_URL="postgresql://pricer_admin:your_secure_password@localhost:5432/pricer_db?schema=public"
   PORT=3001
   ```

4. Define your schema in `prisma/schema.prisma` (example for Invoices):
   ```prisma
   model Invoice {
     id            String   @id @default(uuid())
     invoiceNumber String
     date          DateTime
     status        String
     total         Float
     customerName  String?
     createdAt     DateTime @default(now())
   }
   ```
   Run `npx prisma db push` to create the tables in your running PostgreSQL database.

5. Create `index.js` for your Express server:
   ```javascript
   const express = require('express');
   const cors = require('cors');
   const { PrismaClient } = require('@prisma/client');
   
   const app = express();
   const prisma = new PrismaClient();
   
   app.use(cors());
   app.use(express.json());
   
   // Get all invoices
   app.get('/api/invoices', async (req, res) => {
     const invoices = await prisma.invoice.findMany();
     res.json(invoices);
   });
   
   // Create an invoice
   app.post('/api/invoices', async (req, res) => {
     const invoice = await prisma.invoice.create({
       data: req.body
     });
     res.json(invoice);
   });
   
   app.listen(3001, () => console.log('Server running on port 3001'));
   ```

## Step 4: Modify the Frontend (This App)

You need to change the data fetching logic in the React app to hit your new backend instead of saving locally.

1. Inside `src/lib/store.tsx` (or your data fetching layer), replace local saving logic with `fetch` calls:
   
   ```typescript
   // Example saving an invoice
   const saveInvoiceToDatabase = async (invoiceData) => {
     try {
       const response = await fetch('http://YOUR_SERVER_IP:3001/api/invoices', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(invoiceData)
       });
       return await response.json();
     } catch (error) {
       console.error("Failed to save to self-hosted DB", error);
     }
   }
   ```

2. Point the frontend to your server IP via an environment variable in `.env`:
   ```env
   VITE_API_URL=http://192.168.1.X:3001
   ```

## Step 5: Host the Frontend

Once the frontend is connected to your API, build the React app:
```bash
npm run build
```

You can host the resulting `dist` folder on your server using Nginx, Apache, or simply serve it from your Node.js backend.

## Summary

By running PostgreSQL via Docker and bridging it with a simple Express API, you retain 100% control over your data. No external cloud subscriptions or Firebase limits apply. Make sure your personal server is backed up (e.g., using `pg_dump` on the Postgres container) regularly to prevent data loss.
