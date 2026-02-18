# Baby Name Swipe

## What this project is

A single-page web app for Amrita & Bikram to let friends and family vote on baby boy names before the birth. It works like Tinder for names — swipe right to like, swipe left to pass. Scores are tallied per suggester and shown on a live leaderboard.

The app is a **single HTML file** (`index.html`) with no build step. It is deployed on Netlify as a static site.

---

## Tech stack

| Layer       | Choice                                      |
|-------------|---------------------------------------------|
| Frontend    | Vanilla HTML + CSS + JS (no framework)      |
| Database    | Firebase Firestore (compat CDN v9.23.0)     |
| Fonts       | Cormorant Garamond + Nunito (Google Fonts)  |
| Hosting     | Netlify (static, drag-and-drop deploy)      |

No npm build, no bundler, no framework. Everything is in one file.

---

## File structure

```
/
├── baby-name-swipe.html   ← entire app (HTML + CSS + JS)
├── package.json           ← minimal, only used for Netlify metadata
├── netlify.toml           ← tells Netlify to serve from root, redirects /* to the HTML file
└── CLAUDE.md              ← this file
```

---

## Firebase setup

- **Project ID:** `bikycaughtitli`
- **Service used:** Firestore (NOT Realtime Database)
- **Collection:** `babyNames`
- **Document:** `state`
- **Document shape (current schema):**
  ```json
  {
    "names": [
      {
        "name": "Atharv",
        "suggestedBy": "Biswajit",
        "swipedBy": ["uid_a", "uid_b"],
        "likedBy": ["uid_b"]
      },
      ...
    ]
  }
  ```

- The app uses the Firebase compat SDK loaded via CDN in `<head>` (no npm import).
- The code exposes a small compatibility helper `DOC_REF()` (in `index.html`) which returns the `babyNames/state` doc ref whether `firebase-init.js` exports `window.docRef` or only `window.fireDb`.
- On first load the app will seed the Firestore doc if empty. Live updates use `onSnapshot()` so all devices stay in sync.

Migration notes:
- The app previously used legacy boolean flags `swiped`/`liked`. The code now migrates items to `swipedBy`/`likedBy` arrays on load. Existing boolean fields are preserved only during migration if present but are removed before writing the new schema back to Firestore.

---

## How the app works

### State model (per-item)
Each name entry now uses per-user arrays so multiple people can like/swipe independently without clobbering each other:

```js
{
  name: String,
  suggestedBy: String,      // display name of the suggester (auto-filled from signed-in user)
  swipedBy: [uidString],    // user ids who have swiped this name
  likedBy: [uidString]      // user ids who have liked this name
}
```

- `swipedBy` and `likedBy` are arrays of user identifiers (current code stores raw UIDs). The UI shows readable voter names where available (e.g. if the array contains objects with `displayName`).
- Scores are computed from the length of `likedBy` for each name.
- `currentIndex` remains per-device only (not saved to Firestore) — each person swipes independently.

### Key functions (do not rename)
- `initFirestore()` — waits for auth (the app now initializes Firestore only after Firebase Auth settles), loads data, seeds defaults, migrates legacy flags and sets up `onSnapshot` listener
- `saveState()` — normalizes items (ensures `likedBy`/`swipedBy` arrays, drops legacy booleans) and writes `state.names` to Firestore
- `computeScores()` — derives leaderboard from `likedBy` counts
- `swipeLeft()` / `swipeRight()` — push the current user's UID into `swipedBy` and optionally into `likedBy`, call `saveState()`, advance index
- `undoLast()` — removes the last action for the acting user
- `renderAll()` — re-renders card + all names list + leaderboard
- `addName(name)` — pushes a new name and saves; suggestedBy is automatically set to the signed-in user's display name (the `Suggested by` input was removed from the UI)

### Undo
Only one level of undo is supported (`lastAction` stores the last swipe index only).

---

## Name list

49 names from 9 suggesters. Duplicates already removed.

| Suggester  | Names |
|------------|-------|
| Biswajit   | Atharv, Agastya, Ashwath, Ayushmaan, Aaryav |
| Soumya     | Advitiya, Amrit, Ankush, Adyant, Bansidhar |
| Simple     | Adwait, Akshat, Arjuna, Anksh, Aadvik, Arinjay, Aarush, Anvit, Aarvik |
| Pravanjana | Aarav, Adil, Aayush, Abhimanyu, Aryaveer, Arjan, Advay, Adhrit, Avyan, Ari, Luffy D Patra |
| Gandhi     | Anjaneya, Aghori |
| Amaya      | Amay |
| Ashish     | Ashish, Luffy D Patra Jr |
| Bibhu      | Ahad, Aman, Abhirup, Abiram, Aishat, Arthur, Atin, Agneya, Adikesh, Anik, Adarv, Aayven |
| Ankita     | Arihant, Adarsh, Ashutosh |

---

## Design

- **Theme:** Celestial nursery night sky — deep indigo background, purple/pink nebula gradients, 55 twinkling CSS stars
- **Card:** Frosted glass (`backdrop-filter: blur`) with warm pink shimmer border
- **Typography:** Cormorant Garamond (display/names) + Nunito (body/buttons)
- **Palette:** Cherry blossom pink (`#ffb7c5`), soft lavender (`#bfb0f8`), mint green (`#7de8c0`)
- **Animations:** Floating baby emoji, card swipe rotation, star twinkle, staggered section fade-in
- **No dark/light toggle** — dark only

---

## Constraints & rules

- **Do not change any JS logic** unless explicitly asked — the JS is considered stable
- The app must remain a **single HTML file** with no build step
- Firebase SDK must stay as **compat CDN** (not ES module imports) to match the existing Vue project's pattern
- The file must be openable via a web server (not `file://`) for Firebase to work
- Firestore rules are currently in **test mode** (open read/write) — fine for private family use

---

## Deployment

**Netlify drag-and-drop:**
1. Go to netlify.com → Add new site → Deploy manually
2. Drag the project folder onto the deploy zone

**Netlify CLI:**
```bash
netlify deploy --prod --dir .
```

**Local dev:**
```bash
npx serve .
# open http://localhost:3000/baby-name-swipe.html
```

---

## Known limitations

- Only one undo level (last swipe only)
- `currentIndex` resets on page refresh (each person starts from name #1)
- The app depends on Firebase Auth for per-user behaviour — users must sign in to have their UID stored in `swipedBy`/`likedBy`.
- Currently `likedBy`/`swipedBy` store raw UIDs. To show readable voter names in all places you can change the code to store `{ uid, displayName }` objects (recommended) — the UI already prefers display names when present.
- Firestore test mode expires after 30 days — update rules before then. Consider using a Cloud Function + callable endpoint for admin-only mass operations (like reset) instead of client-side write rules.