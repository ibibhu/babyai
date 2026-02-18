# Baby Name Swipe

## What this project is

A single-page web app for Amrita & Bikram to let friends and family vote on baby boy names before the birth. It works like Tinder for names — swipe right to like, swipe left to pass. Scores are tallied per suggester and shown on a live leaderboard.

The app is a **single HTML file** (`baby-name-swipe.html`) with no build step. It is deployed on Netlify as a static site.

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
- **Document shape:**
  ```json
  {
    "names": [
      { "name": "Atharv", "suggestedBy": "Biswajit", "swiped": false, "liked": false },
      ...
    ]
  }
  ```
- Firebase compat SDK is loaded via CDN in `<head>` (no npm import)
- The app mirrors the same pattern as the existing Vue project's `@/plugins/firebase.js`:
  ```js
  fireDb.collection('babyNames').doc('state')
  ```
- On first load, if the Firestore document is empty, the app seeds it with all 49 default names
- Live updates use `onSnapshot()` so all devices stay in sync in real time

---

## How the app works

### State model
Each name entry:
```js
{ name: String, suggestedBy: String, swiped: Boolean, liked: Boolean }
```

- `swiped: true` means the current user has acted on this name
- `liked: true` means they pressed ♥ Love it (false = ✕ Pass)
- **Scores are computed fresh** from `liked` flags — there is no separate score field
- `currentIndex` is **per-device only** (not saved to Firestore) — each person swipes independently
- The shared Firestore document only stores `names[]` — so swipe state is global

### Key functions (do not rename)
- `initFirestore()` — loads data, seeds defaults, sets up `onSnapshot` listener
- `saveState()` — writes `state.names` to Firestore
- `computeScores()` — derives leaderboard from `liked` flags
- `swipeLeft()` / `swipeRight()` — mark name as swiped/liked, call saveState, advance index
- `undoLast()` — reverses the last single swipe
- `renderAll()` — re-renders card + all names list + leaderboard
- `addName(name, suggestedBy)` — pushes a new name and saves

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
- No authentication — anyone with the URL can swipe and add names
- Firestore test mode expires after 30 days — update rules before then