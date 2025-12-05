# Nightlife OS

**Multi-Mandanten-SaaS-Plattform für Club-Management**

---

**Copyright © 2024 Bernhard Schirnhofer. All Rights Reserved.**

This is proprietary software. Unauthorized copying, distribution, or use of this software is strictly prohibited.  
See [LICENSE](./LICENSE) for details.

## Überblick

Nightlife OS ist eine umfassende Plattform für die Verwaltung von Nachtclubs mit:
- **6 spezialisierte Apps** für verschiedene Nutzergruppen (Gäste, DJ, Admin, Personal)
- **3 shared Packages** für Code-Wiederverwendung
- **Multi-Tenancy** mit isolierten Club-Instanzen
- **Echtzeit-Features** über Firebase/Firestore
- **Mehrsprachigkeit** (DE, EN, FR, ES, IT)

## Architektur

Dieses Projekt ist als **Monorepo** mit **Turborepo** und **pnpm** organisiert.

### Verzeichnisstruktur

```
nightlife_os/
├── apps/                      # Eigenständige Anwendungen
│   ├── club-app/             # 🎵 Besucher-PWA
│   ├── dj-console/           # 🎛️ DJ/Lichtjockey-Steuerung
│   ├── club-admin/           # 🏢 Club-Owner Dashboard
│   ├── staff-door/           # 🚪 Türsteher-App
│   ├── staff-waiter/         # 🍸 Kellner/Bar-App
│   └── staff-cloakroom/      # 🧥 Garderoben-App
├── packages/                  # Shared Packages
│   ├── shared-types/         # 📦 TypeScript-Typen
│   ├── core/                 # 🔥 Firebase, Hooks, Utils
│   └── ui/                   # 🎨 UI-Komponenten, i18n, Theme
├── turbo.json                # Turborepo-Konfiguration
├── pnpm-workspace.yaml       # PNPM Workspace
├── tsconfig.json             # Basis TypeScript-Config
├── ARCHITECTURE.md           # Detaillierte Architektur-Dokumentation
└── FIRESTORE_SCHEMA.md       # Datenbank-Schema
```

### Technologie-Stack

- **Framework:** Next.js 14 (App Router)
- **Monorepo:** Turborepo + pnpm
- **Sprache:** TypeScript (strict mode)
- **Backend:** Firebase (Auth, Firestore, Storage)
- **UI:** Tailwind CSS + Shadcn/ui + Lucide Icons
- **State Management:** React Context + Firebase Realtime
- **Testing:** Vitest + React Testing Library + Playwright

## Installation

### Voraussetzungen

- Node.js 18+ 
- pnpm 8+

### Setup

```bash
# Repository klonen
git clone <repository-url>
cd nightlife_os

# Dependencies installieren
pnpm install

# Umgebungsvariablen einrichten
cp .env.example .env
# .env mit Firebase-Credentials befüllen
```

## Entwicklung

### Alle Apps starten

```bash
pnpm dev
```

### Einzelne App starten

```bash
# Club-App (Besucher-PWA)
pnpm --filter club-app dev

# DJ-Console
pnpm --filter dj-console dev

# Club-Admin Dashboard
pnpm --filter club-admin dev

# Türsteher-App
pnpm --filter staff-door dev

# Kellner/Bar-App
pnpm --filter staff-waiter dev

# Garderoben-App
pnpm --filter staff-cloakroom dev
```

### Build

```bash
# Alle Apps/Packages bauen
pnpm build

# Einzelnes Paket bauen
pnpm --filter shared-types build
pnpm --filter core build
pnpm --filter ui build
```

### Linting

```bash
# Alle Packages/Apps linten
pnpm lint

# Einzelnes Paket linten
pnpm --filter club-app lint
```

### Tests

```bash
# Alle Tests ausführen
pnpm test

# Watch-Mode
pnpm test:watch

# E2E-Tests (Playwright)
pnpm test:e2e
```

## Apps

### 🎵 Club-App (`apps/club-app`)
**Zielgruppe:** Gäste  
**Features:**
- Check-In/Out mit QR-Code
- Chat-System (1:1 und Gruppen)
- Freunde hinzufügen via Friend-Code
- Lichtshow/Countdown/Nachrichten-Overlays
- Gewinnspiele
- PWA-Unterstützung

### 🎛️ DJ-Console (`apps/dj-console`)
**Zielgruppe:** DJ/Lichtjockey  
**Features:**
- Lichtshow-Steuerung (Farbe, Effekte)
- Audio-Sync (Mikrofon-Anbindung)
- Gewinnspiele starten
- Broadcast-Nachrichten senden
- Gästeliste einsehen

### 🏢 Club-Admin (`apps/club-admin`)
**Zielgruppe:** Club-Owner/Admin  
**Features:**
- Dashboard mit Analytics
- Personal-Verwaltung (Rollen zuweisen)
- Club-Einstellungen (Farben, Features, Öffnungszeiten)
- Abo-Verwaltung
- Multi-Club-Support (für Club-Gruppen)

### 🚪 Staff-Door (`apps/staff-door`)
**Zielgruppe:** Türsteher  
**Features:**
- QR-Code-Scanner
- Trust-Level-Verifizierung
- Check-In/Out durchführen
- Blacklist-Prüfung
- Manueller Check-In

### 🍸 Staff-Waiter (`apps/staff-waiter`)
**Zielgruppe:** Kellner/Bar-Personal  
**Features:**
- Bestellungen erstellen/verwalten
- Tischplan
- Bezahlung abschließen
- Bestellungs-Historie

### 🧥 Staff-Cloakroom (`apps/staff-cloakroom`)
**Zielgruppe:** Garderoben-Personal  
**Features:**
- Gegenstände einlagern/ausgeben
- Ticket-System mit QR-Code
- Ticket drucken
- Verlorene Items markieren

## Packages

### 📦 shared-types (`packages/shared-types`)
Zentrale TypeScript-Typen für alle Apps:  
- User, Club, Chat, Message
- Order, Cloakroom
- Rollen & Permissions
- API-Response-Typen

### 🔥 core (`packages/core`)
Zentrale Logik und Firebase-Integration:  
- Firebase-Init & Wrapper-Funktionen
- React Hooks (useAuth, useUserData, useClubState, useI18n, etc.)
- Utils (Friend-Code-Generator, Trust-Score, Validierung, Datum-Formatting)
- Constants (Rollen, Permissions, App-Config)

### 🎨 ui (`packages/ui`)
Wiederverwendbare UI-Komponenten:  
- Basis-Komponenten (Button, Input, Card, Modal, etc.)
- i18n-Lokalisierungen (DE, EN, FR, ES, IT)
- Theme (Farben, Typography, Tailwind-Preset)

## Umgebungsvariablen

Erstelle eine `.env`-Datei im Root-Verzeichnis:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Firestore-Datenmodell

Das vollständige Datenmodell ist in `FIRESTORE_SCHEMA.md` dokumentiert.

**Hauptstruktur:**
- **Plattformebene:** `platform/clubs`, `platform/groups`, `platform/users`
- **Club-Ebene:** `clubs/{clubId}/users`, `clubs/{clubId}/chats`, `clubs/{clubId}/state`, etc.

Jeder Club ist komplett isoliert (Multi-Tenancy).

## Rollen & Berechtigungen

### Rollen-Hierarchie

```
SUPER_ADMIN (Plattform)
└── CLUB_ADMIN / OWNER (Club)
    ├── DJ / LICHTJOCKEY
    └── STAFF
        ├── DOOR (Türsteher)
        ├── WAITER (Kellner)
        ├── BAR (Bar-Personal)
        └── CLOAKROOM (Garderobe)
    └── GUEST (Gast)
```

Details siehe `ARCHITECTURE.md` Abschnitt 3.

## Mehrsprachigkeit (i18n)

Unterstützte Sprachen:
- 🇩🇪 Deutsch (Standard)
- 🇬🇧 Englisch
- 🇫🇷 Französisch
- 🇪🇸 Spanisch
- 🇮🇹 Italienisch

Lokalisierungen in `packages/ui/src/locales/*.json`

Verwendung:
```tsx
import { useI18n } from '@nightlife-os/core';

function MyComponent() {
  const { t, locale, setLocale } = useI18n();
  
  return <h1>{t('common.welcome')}</h1>;
}
```

## Deployment

### Vercel (empfohlen)

```bash
# Vercel CLI installieren
npm i -g vercel

# Projekt deployen
vercel
```

### Andere Plattformen

Jede Next.js-App kann unabhängig deployed werden:
- Netlify
- AWS Amplify
- Google Cloud Run
- Docker

## Entwicklungsplan

### ✅ Phase 1: Setup & Foundation (aktuell)
- Monorepo-Setup
- Packages (shared-types, core, ui)
- App-Scaffolding
- Firebase-Integration

### 🔄 Phase 2: Core Features (geplant)
- Auth-System
- User-Management
- Check-In/Out
- Chat-System
- Lichtshow-Features

### 📅 Phase 3: Staff-Apps (geplant)
- Türsteher-App
- Kellner/Bar-App
- Garderoben-App
- Trust-System

### 📅 Phase 4: Admin & Analytics (geplant)
- Club-Admin Dashboard
- Analytics & Reporting
- Personal-Verwaltung
- Abo-System

### 📅 Phase 5: Advanced Features (geplant)
- Multi-Club-Support
- Club-Gruppen
- Advanced Analytics
- Third-Party-Integrationen

## Lizenz

**Proprietary License - All Rights Reserved**

Copyright © 2024 Bernhard Schirnhofer. All Rights Reserved.

This software and its source code are proprietary and confidential. 

**You may NOT:**
- Use, copy, modify, or distribute this software without explicit written permission
- Use this software for commercial purposes without explicit written permission
- Reverse engineer, decompile, or disassemble this software

For licensing inquiries, please contact Bernhard Schirnhofer.

See the [LICENSE](./LICENSE) file for the complete license agreement.

## Kontakt

**Bernhard Schirnhofer**  
Gründer, Der Wohlstands-Code

---

**Dokumentation:**
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Detaillierte Architektur
- [FIRESTORE_SCHEMA.md](./FIRESTORE_SCHEMA.md) - Datenbank-Schema
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment-Guide
