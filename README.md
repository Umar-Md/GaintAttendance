# GaintAttendance

Full-stack attendance and task management app with a Vite React frontend and an Express/MongoDB backend.

## Local setup

1. Install dependencies:

```sh
cd backend && npm install
cd ../frontend && npm install
```

2. Create environment files from the examples:

```sh
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

3. Update `backend/.env` with your MongoDB URI, JWT secret, and email credentials.

4. Run the backend and frontend in two terminals:

```sh
cd backend
npm run dev
```

```sh
cd frontend
npm run dev
```

By default the backend runs on `http://localhost:7000` and the frontend runs on `http://localhost:5173`.

## Deployment

Backend:

- Build command: `npm install`
- Start command: `npm start`
- Required environment variables: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `ENVI=production`
- Optional environment variables: `PORT`, `FRONTEND_URL`, `EMAIL_USER`, `EMAIL_PASS`
- Health check path: `/health`

Frontend:

- Build command: `npm run build`
- Output directory: `dist`
- Required environment variable: `VITE_API_URL` set to the deployed backend URL
- Optional environment variables: `VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_UPLOAD_PRESET`

If frontend and backend are on different domains, keep `CLIENT_URL` on the backend exactly equal to the deployed frontend origin, for example `https://your-app.vercel.app`.
