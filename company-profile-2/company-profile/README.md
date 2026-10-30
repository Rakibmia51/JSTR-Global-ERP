# Company Profile Setup (MERN)

A multi-step company onboarding flow for the ERP: React wizard (Vite) + Express/Mongoose API with logo upload.

## Structure

```
company-profile/
├── server/   Express + Mongoose API (port 5000)
│   ├── routes/        URL → handler mapping only
│   ├── controllers/   request handling and business logic
│   ├── models/        Mongoose schemas
│   ├── middleware/    auth, logo upload
│   └── utils/         asyncHandler
└── client/   React + Vite wizard (port 5173)
```

## Run it

You need Node 18+ and a running MongoDB (local, or an Atlas URI).

```bash
# 1. API
cd server
cp .env.example .env        # edit MONGODB_URI if needed
npm install
npm run dev

# 2. Client (new terminal)
cd client
npm install
npm run dev
```

Open http://localhost:5173.

## API

| Method | Route                      | Purpose                                        |
|--------|----------------------------|------------------------------------------------|
| GET    | `/api/company/me`          | Current company profile (`null` if none yet)   |
| PUT    | `/api/company/me`          | Create or update; supports saving step by step |
| POST   | `/api/company/me/logo`     | Upload logo (`multipart`, field `logo`, ≤2MB)  |
| DELETE | `/api/company/me/logo`     | Remove logo                                    |
| POST   | `/api/company/me/complete` | Mark setup complete (needs email + country)    |

## Wizard steps

1. **Basics**: name, legal name, industry, size, registration number, tax ID
2. **Contact**: email, phone, website, address
3. **Branding**: logo, currency, timezone, fiscal year start
4. **Review**: confirm and finish

Each "Save & continue" persists to the database, so a user can leave and resume at the step they stopped on.

## Before production

- **Auth:** `server/middleware/auth.js` is a placeholder that reads an `x-user-id` header. Replace it with your real JWT/session middleware so `req.userId` (or a tenant id) comes from a verified token. The same applies to the header in `client/src/api.js`.
- **Logo storage:** logos are saved to `server/uploads/logos`. For multi-server deployments, move to S3/Cloudinary.
- **Multi-tenant:** `owner` is unique per company. If one company has many users, introduce a `companyId` on users and look the company up through it.
