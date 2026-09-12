# 🎆 Sri Madhu Crackers — E-commerce Website

Full-featured online store for Sivakasi fireworks.

## Features
- 123 products / 23 categories with real images & prices
- 🔐 OTP login for Customers & Admin (dev mode shows OTP on screen; plug in Fast2SMS/MSG91 later)
- 🛠️ Admin panel — add / edit / delete products, manage orders & status
- 🌓 Dark / Light mode toggle
- 🌐 5 languages: English, தமிழ், తెలుగు, हिन्दी, ಕನ್ನಡ — smooth animated switching
- 🛒 Cart + checkout with Razorpay (mock payment until keys added) & COD
- ✨ Animations: fireworks hero, scroll reveals, hover effects, animated gradients

## Run locally
```
npm install
npm run dev        # http://localhost:3000
```

## Deploy to AWS (simplest path: EC2 or Lightsail)
1. `aws configure` with your credentials (or attach IAM role)
2. Create DynamoDB tables: `sri-madhu-crackers-products`, `-users`, `-orders`, `-otps` (partition keys: id / phone / id / phone)
3. Copy `.env.example` → `.env.local`, fill in AUTH_SECRET, Razorpay & SMS keys
4. `npm run build && npm start` (use PM2: `pm2 start npm -- start`)

## Admin login
Phone numbers listed in `ADMIN_PHONES` (default 9600331523) can choose "Admin" at login.

## Going live checklist
- [ ] Set `AUTH_SECRET` to a random string
- [ ] Add Razorpay key id/secret (https://dashboard.razorpay.com)
- [ ] Add SMS provider key for real OTP SMS
- [ ] HTTPS via ALB/CloudFront or Caddy
