# GHL Event Manager

A custom event / contract management app built on top of **GoHighLevel** for
restaurants and venues. Contacts arrive from your GHL reservation form, get
converted into fully-priced event contracts (menus, taxes, gratuity, deposits),
and produce a document set (BEO, Contract, Invoice, Kitchen Sheet, Menu,
Proposal) that shares out through GHL.

## The flow

```
GHL reservation form
      │  (lead lands in GHL contacts)
      ▼
Contacts page  ──"Make Contract"──▶  Contract editor
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
                              GHL share & email pages
```

## Stack

- **Next.js 16** (App Router) · **TypeScript** · **Tailwind CSS v4**
- **shadcn/ui** component library
- Server-side GHL v2 API client (`src/lib/ghl/`)
- JSON file persistence (`data/`) behind a one-file storage interface
  (`src/lib/store/file-store.ts`) — swap for GHL custom objects or a DB
  without touching UI code

## Getting started

```bash
npm install
cp .env.example .env.local   # add your GHL credentials
npm run dev
```

Without credentials the app runs in **demo mode** with mock contacts, so the
whole flow is testable immediately.

### GHL credentials

1. In your GHL sub-account: **Settings → Private Integrations → New**
2. Grant `contacts.readonly`, `contacts.write`, `invoices.readonly`, `invoices.write`
3. Put the `pit-...` token in `GHL_API_KEY` and your location id in `GHL_LOCATION_ID`

## App areas

| Route | What it does |
|---|---|
| `/contacts` | Live GHL contact list (search, tags) → "Make Contract" |
| `/contracts` | All contracts with status + grand total |
| `/contracts/[id]` | Full contract editor (event details, contacts, menus, line items, billing widget, terms) |
| `/contracts/[id]/docs` | Document set with Share / Email / Link → GHL pages |
| `/settings/restaurant` | Menus, taxes & fees, venue areas, owners, event styles/types, default terms |
| `/settings/theme` | Theme colors, fonts, heading/paragraph sizes, radius — live preview, applied app-wide |

## Folder structure

```
src/
├── app/                    # routes (App Router)
│   ├── (dashboard)/        # sidebar layout group
│   │   ├── contacts/
│   │   ├── contracts/[id]/(docs)/
│   │   └── settings/(restaurant|theme)/
│   └── api/                # route handlers
│       ├── ghl/contacts/   # proxied GHL contact list
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
│   ├── ghl/                # GHL API client + contact normalization
│   ├── store/              # persistence layer + seed defaults
│   ├── calculations.ts     # totals, taxes, deposit math
│   └── contract-factory.ts # new contract from a GHL contact
└── types/                  # shared domain types
```
