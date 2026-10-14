# TrailBlazer

A review site for running trails. Users can register, add trails (with photos and a map location), browse them on a cluster map, and leave reviews.

Built with Node.js, Express, MongoDB (Mongoose), EJS, Passport for authentication, Cloudinary for image storage, and Mapbox for geocoding and maps.

## Requirements

- Node.js 18 or newer
- A MongoDB database (local, or a free MongoDB Atlas cluster)
- A [Cloudinary](https://cloudinary.com) account (image uploads)
- A [Mapbox](https://www.mapbox.com) account (public access token)

## Run locally

```bash
npm install
cp .env.example .env     # then edit .env with your real values
npm start
```

Open http://localhost:3000.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DB_URL` | Production only | MongoDB connection string. Defaults to `mongodb://localhost:27017/trail-blazer` in development. |
| `SECRET` | Production only | Signs session cookies. Generate with `openssl rand -hex 32`. |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary account name. Also used to allow your images in the Content Security Policy. |
| `CLOUDINARY_KEY` | Yes | Cloudinary API key. |
| `CLOUDINARY_SECRET` | Yes | Cloudinary API secret. |
| `MAPBOX_TOKEN` | Yes | Mapbox public token, used to geocode trail locations and render maps. |
| `PORT` | No | Port to listen on. Defaults to `3000`. |
| `NODE_ENV` | No | Set to `production` on the server. In production the `.env` file is **not** loaded. |
| `COOKIE_SECURE` | No | Set to `true` when served over HTTPS. |

In development these are read from `.env`. In production they must be real environment variables; see `ecosystem.config.example.js`.

## Deploying to a server (EC2, Nginx, PM2)

1. Install Node.js 18+, Nginx, and PM2 on the server, and clone this repository.
2. Run `npm install --omit=dev`.
3. Copy `ecosystem.config.example.js` to `ecosystem.config.js` on the server and fill in the real values.
4. Start the app with `pm2 start ecosystem.config.js`, then `pm2 save` and `pm2 startup` so it survives reboots.
5. Put Nginx in front as a reverse proxy to the app's port, and add HTTPS with certbot.
6. Once HTTPS works, keep `COOKIE_SECURE: 'true'` in the PM2 file.

To update a running server: `git pull && npm install --omit=dev && pm2 restart trailblazer`.

## Notes

- Never commit `.env` or `ecosystem.config.js`. Both are git-ignored.
- In production the app refuses to start if `DB_URL` or `SECRET` is missing.
- Uploaded images are stored in Cloudinary (in a `TrailBlazer` folder, set in `cloudinary/index.js`).
- There is no seed script. Trails are created through the web UI.
