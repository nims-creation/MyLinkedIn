# 🚀 MyLinkedIn Deployment Guide

Congratulations on finishing the MyLinkedIn project! Now it's time to put it live on the internet. We will deploy the **Backend (Express + MongoDB)** to Render, and the **Frontend (Next.js)** to Vercel.

---

## 🟢 Part 1: Deploying the Backend (Render.com)

Render is an excellent, free host for Node.js backends.

1. Create a free account at [Render.com](https://render.com).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub account and select your `MyLinkedIn` repository.
4. Configure the Web Service:
   - **Name**: `mylinkedin-backend` (or similar)
   - **Environment**: Node
   - **Region**: (Choose the closest one to you)
   - **Branch**: `main`
   - **Root Directory**: `server` *(Important! Since your backend is in the server folder)*
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
5. **Environment Variables**:
   Scroll down to Advanced > Environment Variables and add:
   - `PORT`: `5000`
   - `MONGODB_URI`: (Your MongoDB Atlas connection string)
   - `NODE_ENV`: `production`
6. Click **Create Web Service**.
   - Render will build and start your server. 
   - Once it's running, copy the URL provided by Render (e.g., `https://mylinkedin-backend.onrender.com`).

---

## 🟢 Part 2: Deploying the Frontend (Vercel.com)

Vercel is the creator of Next.js and the best place to host the frontend.

1. Go to your backend `.env` or just note the Render URL you copied in Part 1.
2. Log into [Vercel.com](https://vercel.com) with GitHub.
3. Click **Add New...** > **Project**.
4. Import your `MyLinkedIn` repository.
5. In the configuration screen:
   - **Framework Preset**: Next.js (Vercel auto-detects this).
   - **Root Directory**: `./` (Leave it at the root).
   - **Environment Variables**: Add all your Firebase variables PLUS the new API URL:
     - `NEXT_PUBLIC_API_URL`: (Paste your Render URL here, e.g., `https://mylinkedin-backend.onrender.com/api`)
     - `NEXT_PUBLIC_FIREBASE_API_KEY`: ...
     - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: ...
     - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: ...
     - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`: ...
     - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`: ...
     - `NEXT_PUBLIC_FIREBASE_APP_ID`: ...
6. Click **Deploy**.

## 🟢 Part 3: Update CORS & Final Polish

Once your frontend is deployed on Vercel, it will give you a live URL (e.g., `https://mylinkedin.vercel.app`).

1. Go back to your code in `server/index.js`.
2. Find the CORS configuration array.
3. Add your new Vercel URL to the allowed origins.
4. `git push` those changes to GitHub. Render will automatically rebuild with the new CORS rules!

**🎉 You're done! Your full-stack MyLinkedIn app is now live and ready to be shared on your resume!**
