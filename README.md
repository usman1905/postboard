# PostBoard

A shared content calendar for teams that run social media for several brands, with a client approval step before anything is posted.

**Live demo:** [usman1905.github.io/postboard](https://usman1905.github.io/postboard/)

[![Tests](https://github.com/usman1905/postboard/actions/workflows/ci.yml/badge.svg)](https://github.com/usman1905/postboard/actions/workflows/ci.yml)

## What it does

- Month calendar starting on Monday, with every planned post shown by time and brand colour
- Filter the calendar by brand
- Drag a post to another day to reschedule it
- Click an empty day to plan a post there, or click a post to edit or delete it
- Each post has brand, platform, format, date, time, caption (with the 2,200 character Instagram limit) and status
- Statuses: Draft, In review, Approved, Published
- Approval queue: approve a post, or send it back to draft with changes requested
- Monthly totals for planned, published, approved and waiting posts

Data is stored in the browser with `localStorage`. The demo starts with a sample month for three brands.

## Tech

Plain HTML, CSS and JavaScript with the native drag and drop API, no framework.

| Path | Purpose |
| --- | --- |
| `index.html` | Calendar, approval panel and the post dialog |
| `style.css` | Dark theme, responsive calendar that collapses to colour bars on phones |
| `app.js` | User interface: rendering, events and storage |
| `src/calendar.js` | Month grid, rescheduling rules, approvals, validation and monthly counts (no DOM, fully tested) |
| `tests/calendar.test.js` | 8 tests for the calendar maths and post rules |
| `.github/workflows/ci.yml` | Runs the tests on every push |

## Run locally

The app uses ES modules, so serve the folder rather than opening the file directly:

```bash
npm start
```

Then open the address it prints.

## Tests

Needs Node.js 18 or newer. No dependencies to install.

```bash
npm test
```

## Roadmap

- Shareable client approval links
- Publishing through the Meta Graph API
- Team accounts with roles

## License

MIT. Built by [Usman](https://usman1905.github.io).
