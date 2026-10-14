// PM2 process file for production (EC2).
//
// 1. Copy this file to "ecosystem.config.js" ON THE SERVER (it is git-ignored).
// 2. Replace every placeholder with a real value.
// 3. Start the app:  pm2 start ecosystem.config.js
//
// In production the app does not read a .env file, so PM2 supplies the variables.
module.exports = {
  apps: [
    {
      name: 'trailblazer',
      script: 'app.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3001, // pick a port no other app on the server uses
        DB_URL: 'mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/trail-blazer?retryWrites=true&w=majority',
        SECRET: 'replace-with-output-of-openssl-rand-hex-32',
        CLOUDINARY_CLOUD_NAME: 'your_cloud_name',
        CLOUDINARY_KEY: 'your_api_key',
        CLOUDINARY_SECRET: 'your_api_secret',
        MAPBOX_TOKEN: 'your_mapbox_public_token',
        COOKIE_SECURE: 'true', // only once the site is served over HTTPS
      },
    },
  ],
};
