[![Netlify Status](https://api.netlify.com/api/v1/badges/5dad78c1-3326-4fb3-8a5f-2f9b1c415472/deploy-status)](https://app.netlify.com/projects/amrita-bikis-titla/deploys)

# Baby Name Swipe

Single-file static web app for friends & family to vote on baby boy names — swipe right to like, swipe left to pass. The app is implemented as a single HTML file (`index.html`) with no build step and uses Firestore for realtime sync.

Preview (deployed): https://amrita-bikis-titla.netlify.app/

## Tech stack

- Frontend: Vanilla HTML, CSS and JavaScript (single-file app)
- Database: Firebase Firestore (compat CDN)
- Auth: Firebase Google Sign-In (compat CDN)
- Hosting / Preview: Netlify (static site)

## Run locally

1. Serve the folder (recommended) and open the app in your browser:

```bash
npx serve .
# then open http://localhost:3000/index.html
```

2. Alternatively use the Netlify CLI to test a full deploy flow:

```bash
netlify deploy --prod --dir .
```

Notes
- The app must be served over HTTP(S) (Firebase won't work on `file://`).
- The Firestore project and rules are configured for private family use; check `firebase-init.js` for project settings.

See `CLAUDE.md` for a detailed project description, migration notes and design details.
