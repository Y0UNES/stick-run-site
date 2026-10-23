Stick Run - site folder
  index.html     the game
  admin.html     the owner's dashboard (only your Google account gets in)
  config.js      the project address and public key
  vendor/        the Supabase library
  vercel.json    security headers for Vercel
Publish: push this folder to a GitHub repo and import it on vercel.com (no build command, no framework),
or run  npx vercel --prod  inside the folder.
