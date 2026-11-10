# Rouh · LC front end

Rouh is AIESEC in Egypt's CRM. This repo holds the front end of its **LC side**: the pages LC members,
team leaders, VPs and LCPs use every day. It's here so the design and the page logic can be reviewed and
improved without the rest of the system.

It contains **only the front end**: page templates, styles, scripts and images. There is no backend code,
no database, no real data, no keys and no passwords. The MC's own pages (MC data, OPS, Supply & Demand
analysis, awards, settings) are left out.

## Look at it first: `preview/`

From the project root, run `python3 -m http.server 8000 --bind 127.0.0.1`, then open
[the preview index](http://127.0.0.1:8000/preview/index.html). The saved pages use sample records.
The index links to the public landing page, sample sign-in and sign-up, and the LC workspace.

What the preview can't do, because there's no server behind it:

- forms show preview feedback, and changes are never sent to Rouh;
- parts that load on their own after the page opens (htmx) stay as they are in the saved page;
- links to pages that aren't included show a message that they need the full Rouh app.

The preview uses saved HTML. Refresh after changes to `preview/` or `static/`. Changes to Django templates appear in the full app or in refreshed preview HTML.

## What's where

| Folder | What it is |
|---|---|
| `templates/base.html` | The shell every page sits in: sidebar, top bar, fonts, scripts |
| `templates/partials/` | Pieces of that shell: navigation, top bar, LC picker |
| `templates/components/` | Shared building blocks: badge, button, card, empty state, metric tile |
| `templates/ui/` | Home, each function's desk page, the public landing page |
| `templates/account/` | Sign in, sign up, password pages, and the emails they send |
| `templates/accounts/` | People: directory, LC tree (teams, coordinators, team leaders), join requests, invites |
| `templates/exchange/` | The exchange desks (oGV, oGTa, oGTe, iGV, iGTa, iGTe): sign-ups, APDs, teams, analysis |
| `templates/raising/` | iCX raising: accounts, calendar |
| `templates/b2c/` | B2C: interviews, campaigns, campus access, analysis |
| `templates/b2b/` | B2B and BD: accounts, slots, calendar, cash-in |
| `templates/tm/` | Talent: overview, performance, planning, attendance, structure |
| `templates/rcr/` | Talent › RCR: recruitment leads, booking, interviews, the RCR board |
| `templates/nes/` | Talent › NES: the monthly NES form and the LC's NES report |
| `templates/od/` | The LC dashboard (OD model) |
| `templates/events/`, `templates/finance/` | LC events, the LC's finance dashboard |
| `templates/mc/qs/` | The LC's quarterly Qs (two LC pages that live in this folder in Rouh) |
| `static/css/app.css` | The one stylesheet for the app (`auth.css`: sign-in pages, `landing.css`: landing page) |
| `static/js/` | Page scripts: `app.js` everywhere, the others on their own pages |
| `static/img/` | Logo and icons |

## How a template works

Rouh is a Django app, so the templates use the Django template language on top of plain HTML:

- `{{ value }}` prints a value; `{{ value|date:"j M Y" }}` formats it.
- `{% if %}`, `{% for %}`, `{% url 'name' %}` (a link), `{% trans "Text" %}` (text that can be translated).
- `{% extends "base.html" %}` and `{% block content %}` put a page inside the shell;
  `{% include "partials/x.html" %}` pulls in a piece.

Interactivity comes from two small libraries already loaded in `base.html`:

- **htmx** (`hx-get`, `hx-post`, `hx-target`, `hx-trigger`): fetch part of a page and swap it in.
- **Alpine.js** (`x-data`, `x-show`, `@click`): small bits of state, such as open/closed.

## Rules when you change something

1. Keep every `{{ }}`, `{% %}`, `hx-*`, `x-*`, `name=` and `id=` working: the server fills them, and
   forms and tests depend on them. Move them, restyle around them, but don't drop or rename them.
2. Style through the variables at the top of `app.css` (`--text`, `--border`, `--surface`…) rather than
   new hard-coded colours.
3. Check each page at phone width (about 390px): nothing should scroll sideways.
4. Never put real names, emails, phone numbers or keys in this repo.
5. Send changes as a pull request, one area at a time (for example "RCR leads table"), with a screenshot
   before and after. Changes are merged into Rouh by the MC.
