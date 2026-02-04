# GitHub Profile Fetcher 🧑‍💻

A modern, single-page dashboard for exploring any public GitHub profile.  
Enter a username and instantly see profile details, activity stats, top languages, and a paginated, filterable view of repositories.

Built with **plain HTML**, **Tailwind CSS**, and **vanilla JavaScript** (no framework).

---

## Features

- **Profile overview**
  - Avatar, name, username
  - Bio, location, company, website, Twitter
  - Followers, following, public repo counts
  - Account age and basic visual stats (repos, gists, age bars)

- **Repositories**
  - Fetches up to 100 public repositories
  - Sort by **stars** or by **last updated**
  - **Filter by name** (live search)
  - Shows **3 repositories per page** with Prev/Next slider-style navigation
  - Cards include language badge, stars, forks, watchers, and last updated date

- **Skills / Top languages**
  - Aggregates languages across repos
  - Displays responsive language chips with usage count and icons

- **Recent searches**
  - Stores the last few usernames in `localStorage`
  - Click a chip to instantly reload that profile

- **Rate-limit friendly**
  - Optional GitHub personal access token support to increase API limits

---

## Getting started

### 1. Clone the repo

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
```

### 2. Install dependencies (for Tailwind build, optional)

If you want to rebuild `output.css` using Tailwind:

```bash
npm install
```

You can also use the existing compiled `output.css` and skip this step.

### 3. Run locally

This is a static site. You can:

- Open `src/index.html` directly in your browser, **or**
- Serve `src/` with any static server, e.g.:

```bash
npx serve src
```

---

## GitHub API token (optional but recommended)

Unauthenticated GitHub API requests are limited to **60 requests/hour per IP**.  
To increase that limit:

1. Create a **fine-grained** or **classic** personal access token on GitHub with public access only.
2. Open `src/script.js`.
3. At the top, set `GITHUB_TOKEN` to your token **locally only**:

```js
// IMPORTANT: do NOT commit your real token
const GITHUB_TOKEN = "ghp_xxx_your_token_here";
```

4. Make sure `.gitignore` excludes `.env`/secrets and never commit real tokens.

The token is only used client-side to add an `Authorization: Bearer <token>` header to API calls.

---

## Project structure

```text
src/
  index.html   # Main UI
  script.js    # GitHub API + UI logic
  style.css    # Custom glassmorphism / animations
  input.css    # Tailwind entry (if you want to rebuild)
  output.css   # Compiled Tailwind CSS
```

---

## Customization ideas

- Add dark/light mode toggle
- Show pinned / starred repos separately
- Add contribution calendar via a separate API or SVG
- Export profile summary as a PDF or shareable link

---

## License

MIT – feel free to use, modify, and adapt this project for your own dashboards and experiments with the GitHub API.

# github
# github
