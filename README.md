# Event Manager (OmniCather)

A custom event / contract management app built on top of **OmniCather** for
restaurants and venues. Contacts arrive from your OmniCather reservation form, get
converted into fully-priced event contracts (menus, taxes, gratuity, deposits),
and produce a document set (BEO, Contract, Invoice, Kitchen Sheet, Menu,
Proposal) that shares out through OmniCather.

## The flow

```
OmniCather reservation form
      │  (lead lands in OmniCather contacts — contacts stay there)
      ▼
OmniCather contact ──"Make Contract" link──▶  /make-contract?contactId={{contact.id}}
                                        │  (draft auto-created)
                                        ▼
                                     Contract editor
                                        │  event details · areas · status
                                        │  Food / Beverage / Other line items
                                        │  Add from Menu · Add Freehand
                                        │  billing widget (tax, gratuity,
                                        │  admin fee, deposit, F&B minimum)
                                        ▼
                                   Save & View Docs
                                        │
                                        ▼
                              Documents page (BEO, Contract,
                              Invoice, Kitchen Sheet, Menu, Proposal)
                                        │  Share / Email / Link
                                        ▼
                              OmniCather share & email pages
```

## Stack

- **Next.js 16** (App Router) · **TypeScript** · **Tailwind CSS v4**
- **shadcn/ui** component library
- Server-side OmniCather API client (`src/lib/ghl/`)
- JSON file persistence (`data/`) behind a one-file storage interface
  (`src/lib/store/file-store.ts`) — swap for OmniCather custom objects or a DB
  without touching UI code

## Getting started

```bash
npm install
cp .env.example .env.local   # add your OmniCather credentials
npm run dev
```

Without credentials the app runs in **demo mode** with mock contacts, so the
whole flow is testable immediately.

### OmniCather credentials

1. In your OmniCather sub-account: **Settings → Private Integrations → New**
2. Grant `contacts.readonly`, `contacts.write`, `invoices.readonly`, `invoices.write`
3. Put the `pit-...` token in `GHL_API_KEY` and your location id in `GHL_LOCATION_ID`

## App areas

| Route | What it does |
|---|---|
| `/make-contract?contactId=...` | Entry point opened from OmniCather — auto-creates a draft event + contract for that contact (without a contactId it shows setup instructions) |
| `/events` | Events list grouped Today / Next 7 Days / Beyond, with search + Upcoming/All filter |
| `/events/[id]` | Event view with tabs: Details, Docs, Discussion, Payments, Tasks, Notes, Log |
| `/events/[id]/edit` | Event editor (dates via shadcn calendar, guests, managers, lead sources, financial summary, custom fields) |
| `/contracts/[id]` | Contract & Event Order editor (contact info, line items from menus, kitchen notes, setup, billing widget with custom rows & tax compounding, terms) |
| `/settings/restaurant` | Menus, taxes & fees, venue areas, owners, event styles/types, default terms |
| `/settings/theme` | Theme colors, fonts, heading/paragraph sizes, radius — live preview + auto-save |

## Deploying

### Netlify

The repo ships with a [netlify.toml](netlify.toml) — connect the repo and
deploy; the official Next.js runtime plugin handles the App Router and API
routes automatically. **Important:** if the site was created before this
file existed, clear any custom *Publish directory* in Site settings → Build
& deploy (it must be left to the plugin) and trigger "Clear cache and
deploy site".

Set your environment variables in Site settings → Environment:

```
GHL_API_KEY=pit-...
GHL_LOCATION_ID=...
```

**Storage on serverless hosts:** Netlify/Vercel functions have a read-only
project filesystem, so the JSON store automatically falls back to `/tmp` +
an in-memory mirror (see `src/lib/store/file-store.ts`). That keeps the
whole app working, but `/tmp` is per-instance and ephemeral — edits can
reset between cold starts. For durable production data either:

- set `DATA_DIR` to a mounted persistent disk (self-hosted / Render /
  Railway volumes), or
- deploy with `npm run build && npm run start` on any Node host, or
- keep Netlify for the UI and rely on OmniCather as the source of truth
  (settings already mirror to an OmniCather custom value; contacts,
  messages and notes sync live).

## Folder structure

```
src/
├── app/                    # routes (App Router)
│   ├── (dashboard)/        # sidebar layout group
│   │   ├── contacts/
│   │   ├── contracts/[id]/(docs)/
│   │   └── settings/(restaurant|theme)/
│   └── api/                # route handlers
│       ├── ghl/contacts/   # proxied contact list
│       ├── contracts/      # contract CRUD
│       └── settings/       # restaurant + theme settings
├── components/
│   ├── contacts/           # contact table
│   ├── contract/           # editor sections (line items, billing widget…)
│   ├── docs/               # documents view
│   ├── settings/           # menu manager, tax manager, theme editor…
│   ├── layout/             # sidebar, topbar
│   ├── theme/              # ThemeProvider (CSS variable injection)
│   └── ui/                 # shadcn components
├── lib/
│   ├── ghl/                # OmniCather API client + contact normalization
│   ├── store/              # persistence layer + seed defaults
│   ├── calculations.ts     # totals, taxes, deposit math
│   └── contract-factory.ts # new contract from a contact
└── types/                  # shared domain types
```
