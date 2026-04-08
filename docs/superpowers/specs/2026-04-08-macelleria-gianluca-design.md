# Macelleria Gianluca — Gestionale Spese

## Panoramica

Gestionale spese per la macelleria di Gianluca. App web React (SPA) con Supabase come backend, deployata su Vercel. Usata principalmente da telefono dal proprietario, ma anche da desktop. Nessuna autenticazione — accesso diretto via URL.

## Stack Tecnologico

- **Frontend:** React 18 + Vite + TypeScript
- **Styling:** TailwindCSS 3 + CSS variables per dark mode
- **Database:** Supabase (PostgreSQL) via @supabase/supabase-js
- **Grafici:** Recharts (leggera, responsive, touch-friendly)
- **Export:** papaparse (CSV), JSON nativo
- **Icone:** Lucide React (leggere, consistenti)
- **Deploy:** Vercel (static site)
- **Credenziali:** .env con VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY

## Architettura

React SPA client-side che comunica direttamente con Supabase. Nessun backend custom. Le RLS policies di Supabase sono disabilitate (app privata senza auth). Deploy come sito statico su Vercel.

```
Browser (React SPA)
    ↓ @supabase/supabase-js
Supabase (PostgreSQL + REST API)
```

### Struttura file progetto

```
src/
├── main.tsx                    # Entry point
├── App.tsx                     # Router + layout + theme provider
├── lib/
│   ├── supabase.ts            # Client Supabase
│   ├── types.ts               # TypeScript types (DB schema)
│   └── constants.ts           # Categorie, sottocategorie, IVA rates
├── hooks/
│   ├── useRevenues.ts         # CRUD incassi
│   ├── useExpenses.ts         # CRUD spese
│   ├── useEmployees.ts        # CRUD operai
│   ├── useSalaryPayments.ts   # CRUD pagamenti stipendi
│   └── useDashboard.ts        # Query aggregate per dashboard
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx      # Layout wrapper (sidebar desktop, bottom nav mobile)
│   │   ├── BottomNav.tsx      # Navigazione mobile
│   │   ├── Sidebar.tsx        # Navigazione desktop
│   │   └── ThemeToggle.tsx    # Switch light/dark mode
│   ├── ui/
│   │   ├── Card.tsx           # Card container riutilizzabile
│   │   ├── Button.tsx         # Bottone primario/secondario
│   │   ├── Input.tsx          # Input con label e validazione
│   │   ├── Select.tsx         # Select dropdown
│   │   ├── DatePicker.tsx     # Selettore data con navigazione
│   │   ├── Modal.tsx          # Modale conferma/form
│   │   ├── Toast.tsx          # Notifiche feedback
│   │   └── LoadingSpinner.tsx # Indicatore caricamento
│   ├── revenues/
│   │   └── RevenueForm.tsx    # Form incasso giornaliero (cassa + POS)
│   ├── expenses/
│   │   ├── ExpenseForm.tsx    # Form aggiunta spesa
│   │   └── ExpenseList.tsx    # Lista spese con filtri
│   ├── dashboard/
│   │   ├── DailyView.tsx      # Vista giornaliera
│   │   ├── WeeklyView.tsx     # Vista settimanale con grafici
│   │   ├── MonthlyView.tsx    # Vista mensile con grafici
│   │   └── PeriodToggle.tsx   # Toggle giorno/settimana/mese
│   ├── suppliers/
│   │   ├── SupplierList.tsx   # Lista fornitori con totali
│   │   └── SupplierDetail.tsx # Dettaglio movimenti fornitore
│   └── settings/
│       ├── EmployeeManager.tsx # Gestione operai
│       ├── SalaryManager.tsx   # Gestione stipendi mensili
│       └── ExportData.tsx      # Export CSV/JSON
├── pages/
│   ├── RevenuesPage.tsx       # Pagina incassi (home)
│   ├── ExpensesPage.tsx       # Pagina spese
│   ├── DashboardPage.tsx      # Pagina dashboard
│   ├── SuppliersPage.tsx      # Pagina fornitori
│   └── SettingsPage.tsx       # Pagina altro (operai, export, impostazioni)
└── styles/
    └── index.css              # Tailwind directives + CSS variables tema
```

## Database Schema (Supabase/PostgreSQL)

### Tabella: daily_revenues

| Colonna | Tipo | Vincoli | Note |
|---------|------|---------|------|
| id | uuid | PK, default gen_random_uuid() | |
| date | date | UNIQUE, NOT NULL | Un record per giorno |
| cash_amount | numeric(10,2) | NOT NULL, default 0 | Contanti |
| pos_amount | numeric(10,2) | NOT NULL, default 0 | POS carte |
| note | text | nullable | Nota opzionale |
| created_at | timestamptz | default now() | |
| updated_at | timestamptz | default now() | Trigger auto-update |

### Tabella: expenses

| Colonna | Tipo | Vincoli | Note |
|---------|------|---------|------|
| id | uuid | PK, default gen_random_uuid() | |
| date | date | NOT NULL | Data spesa |
| category | text | NOT NULL | fornitori_carne, macellazione, gestione, salumi, varie (gli stipendi NON passano da questa tabella — hanno salary_payments dedicata) |
| subcategory | text | NOT NULL | Es: "Amadori", "Affitto", "Luce" |
| amount | numeric(10,2) | NOT NULL | Importo |
| amount_net | numeric(10,2) | NOT NULL | Importo netto IVA (calcolato client-side: amount / (1 + vat_rate/100)) |
| vat_rate | integer | NOT NULL, default 22 | 10 o 22 |
| note | text | nullable | Nota opzionale |
| created_at | timestamptz | default now() | |

Indici: (date), (category), (category, date), (subcategory, date)

### Tabella: employees

| Colonna | Tipo | Vincoli | Note |
|---------|------|---------|------|
| id | uuid | PK, default gen_random_uuid() | |
| name | text | NOT NULL, UNIQUE | Nome operaio |
| monthly_salary | numeric(10,2) | NOT NULL, default 0 | Stipendio mensile |
| is_active | boolean | NOT NULL, default true | Attivo/disattivato |
| created_at | timestamptz | default now() | |

Seed data: Gianluca, Giacomo, Aurora (is_active: true)

### Tabella: salary_payments

| Colonna | Tipo | Vincoli | Note |
|---------|------|---------|------|
| id | uuid | PK, default gen_random_uuid() | |
| employee_id | uuid | FK → employees(id), NOT NULL | |
| month | date | NOT NULL | Primo del mese (es: 2026-04-01) |
| type | text | NOT NULL | stipendio, inps, tfr |
| amount | numeric(10,2) | NOT NULL | Importo pagato |
| note | text | nullable | |
| created_at | timestamptz | default now() | |

Constraint UNIQUE: (employee_id, month, type)

## Categorie Spese

Definite come costanti nel codice (non in tabella DB — sono poche e fisse).

| Categoria | Sottocategorie | IVA |
|-----------|---------------|-----|
| Fornitori Carne | Amadori, CCM, SicilPolli, Coincialdi, Bruno Alimentare | 10% |
| Macellazione | Campo libero (importo + nota) | 10% |
| Gestione | Affitto, Luce, Gas, Acqua, Manutenzione, Commercialista | 22% |
| Salumi | Troina Salumi + campo libero altri fornitori | 10% |
| Stipendi | Gestiti via sezione Operai (stipendio, INPS, TFR) | — |
| Varie | Campo libero + nota obbligatoria | 22% |

L'IVA si auto-imposta in base alla categoria ma è modificabile manualmente.

## Design & Tema

### Approccio: "Caldo & Accogliente" (Shopify-style)

**Light mode (default):**
- Background page: #FAF8F5 (crema caldo)
- Header: #292524 (scuro stone)
- Card background: #FFFFFF con bordi #E7E5E4
- Card colorate per tipo:
  - Cassa: sfondo gradient verde chiaro (#F0FDF4 → #FFFFFF), bordo #D1FAE5
  - POS: sfondo gradient blu chiaro (#EFF6FF → #FFFFFF), bordo #DBEAFE
  - Totale: gradient oro (#FEF3C7 → #FDE68A), bordo #FCD34D
  - Spese: sfondo gradient rosso chiaro (#FEF2F2 → #FFFFFF), bordo #FECACA
- Testo primario: #1A1A1A
- Testo secondario: #616161
- Bottone primario: #292524 con testo bianco

**Dark mode (toggle):**
- Background page: #1A1A1A
- Header: #292524
- Card background: #303030 con bordi #404040
- Card colorate: stessa logica ma con opacità ridotta
- Testo primario: #E3E3E6
- Testo secondario: #8C8C8C
- Bottone primario: #FFFFFF con testo nero

**Colori semantici (entrambi i temi):**
- Entrate/Successo: #16A34A (green-600)
- POS/Info: #2563EB (blue-600)
- Spese/Errore: #DC2626 (red-600)
- Warning: #D97706 (amber-600)

**Tipografia:**
- Font: Inter (Google Fonts) con fallback system-ui
- Heading: font-weight 650-750
- Body: font-weight 400-500
- Numeri grandi (importi): font-weight 700, size 24-34px

**UI:**
- Border radius: 10-12px per card, 8px per bottoni/input
- No ombre pesanti — stile flat con bordi sottili
- Icone colorate come accento nelle card (Lucide)
- Bottoni grandi (min 44px height) per uso touch
- Toggle dark mode nell'header

**Responsive:**
- Mobile (<768px): Bottom tab navigation, layout verticale, 1 colonna
- Desktop (≥768px): Sidebar laterale 220px, grid layout, 2-3 colonne
- Breakpoint gestito con Tailwind: md:

### Navigazione

**Mobile — Bottom Tab Bar (5 tab):**
1. Incassi (home, prima schermata)
2. Spese
3. Dashboard
4. Fornitori
5. Altro (operai, export, impostazioni)

**Desktop — Sidebar:**
Stesse 5 sezioni + sotto-voci visibili (Operai, Export, Impostazioni come voci separate)

## Funzionalità Dettagliate

### 1. Incassi Giornalieri (Pagina Home)

- Selettore data con bottoni "← Ieri" / "Domani →" + picker calendario
- Due campi grandi: Cassa (contanti) e POS (carte)
- Totale giornaliero calcolato automaticamente (cassa + POS)
- Bottone "Salva Incasso" — upsert su Supabase (insert o update se esiste già per quel giorno)
- Feedback visivo: toast "Incasso salvato" con check verde
- Se esiste già un incasso per la data selezionata, i campi si pre-compilano con i valori salvati
- Campo nota opzionale

### 2. Registrazione Spese

- Selettore data (default: oggi)
- Select categoria (6 opzioni)
- Select sottocategoria (dinamica in base alla categoria scelta)
  - Fornitori carne: dropdown con Amadori, CCM, SicilPolli, Coincialdi, Bruno Alimentare
  - Macellazione: campo importo diretto + nota
  - Gestione: dropdown con Affitto, Luce, Gas, Acqua, Manutenzione, Commercialista
  - Salumi: dropdown con Troina Salumi + opzione "Altro" (campo libero)
  - Stipendi: redirect alla sezione Operai
  - Varie: campo libero descrizione + nota obbligatoria
- Campo importo (numerico, con €)
- IVA auto-selezionata ma modificabile (toggle 10%/22%)
- Campo nota opzionale
- Bottone "Aggiungi Spesa"
- Lista spese del giorno sotto il form, con possibilità di eliminare (conferma modale)
- Filtro rapido per categoria

### 3. Dashboard

**Toggle periodo:** 3 bottoni — Giorno / Settimana / Mese

**Vista Giornaliera:**
- 3 card riassuntive: Totale Incassi (verde), Totale Spese (rosso), Margine (verde se positivo, rosso se negativo)
- Lista spese del giorno raggruppate per categoria
- Incasso dettagliato (cassa vs POS)

**Vista Settimanale (lun-sab):**
- Navigazione settimana (← settimana precedente / successiva →)
- Grafico a barre Recharts: incassi per giorno (barre verdi cassa + blu POS, stacked)
- Tabella spese per categoria con totali
- Card riassuntive: Totale Incassi settimanali, Totale Spese, Utile settimanale
- Split cassa vs POS con percentuali

**Vista Mensile:**
- Navigazione mese (← mese precedente / successivo →)
- Grafico a linee: andamento incassi per settimana del mese
- Pie chart: distribuzione spese per categoria (Recharts PieChart)
- Grafico confronto settimane (barre raggruppate)
- Card riassuntive: Fatturato lordo, Totale uscite (per categoria), Utile netto
- Dettaglio stipendi del mese (per operaio)

### 4. Riepilogo Fornitori

- Lista fornitori con totale speso (ordinata per importo decrescente)
- Filtro periodo: settimana corrente / mese corrente / personalizzato
- Click su fornitore → dettaglio con lista movimenti (data, importo, nota)
- Card totale in cima alla lista
- I fornitori vengono estratti automaticamente dalle sottocategorie delle spese

### 5. Gestione Operai (sezione Altro)

- Lista operai attivi con stipendio mensile
- Bottone "Aggiungi Operaio" (nome + stipendio)
- Edit stipendio (click sul valore → input editabile)
- Toggle attivo/disattivo (non elimina, nasconde)
- Sezione pagamenti mensili:
  - Selettore mese
  - Per ogni operaio: 3 campi (Stipendio, INPS, TFR) con importo
  - Stipendio pre-compilato dal valore impostato, INPS e TFR da inserire
  - Bottone "Registra Pagamenti Mese"

### 6. Export Dati (sezione Altro)

- Selettore periodo (da/a)
- 4 bottoni export:
  1. **Tutte le Spese (CSV)** — colonne: Data, Categoria, Sottocategoria, Importo, IVA%, Importo Netto, Nota
  2. **Tutti gli Incassi (CSV)** — colonne: Data, Cassa, POS, Totale
  3. **Riepilogo Fornitori (CSV)** — colonne: Fornitore, Categoria, Totale Periodo, N. Movimenti
  4. **Report Mensile Completo (CSV)** — spese + incassi + utile in un unico file
- Bottone **Backup Completo (JSON)** — dump intero database per backup
- I CSV sono formattati per Excel (separatore ;, encoding UTF-8 BOM, formato numeri italiano)

### 7. Calcolo IVA

- Ogni spesa ha un campo vat_rate (10 o 22)
- Auto-assegnato in base alla categoria:
  - fornitori_carne, macellazione, salumi → 10%
  - gestione, varie → 22%
  - stipendi → nessuna IVA
- Modificabile manualmente su ogni singola spesa
- Nella dashboard e negli export: mostra sia importo lordo che netto IVA
- Formula: importo_netto = importo / (1 + vat_rate/100)

### 8. Ricerca e Filtri

- Barra ricerca globale nella pagina Spese (cerca in sottocategoria e note)
- Filtri combinabili: data (range), categoria, fornitore
- Risultati aggiornati in tempo reale

### 9. Conferma Eliminazione

- Ogni voce (spesa, incasso, pagamento) ha icona cestino
- Click → modale di conferma "Sei sicuro di voler eliminare questa voce?"
- Bottoni: "Annulla" (secondario) / "Elimina" (rosso)

### 10. Loading States & Feedback

- Spinner su ogni caricamento dati
- Skeleton loader per card e liste durante il fetch
- Toast notifications: successo (verde), errore (rosso), warning (arancio)
- Bottoni disabilitati durante submit (previene doppio click)
- Stato vuoto con illustrazione quando non ci sono dati

## Librerie & Dipendenze

```json
{
  "dependencies": {
    "react": "^18.3",
    "react-dom": "^18.3",
    "react-router-dom": "^6.28",
    "@supabase/supabase-js": "^2.47",
    "recharts": "^2.15",
    "lucide-react": "^0.468",
    "papaparse": "^5.4",
    "date-fns": "^4.1",
    "react-hot-toast": "^2.4"
  },
  "devDependencies": {
    "typescript": "^5.7",
    "vite": "^6.0",
    "@vitejs/plugin-react": "^4.3",
    "tailwindcss": "^3.4",
    "postcss": "^8.4",
    "autoprefixer": "^10.4",
    "@types/react": "^18.3",
    "@types/react-dom": "^18.3",
    "@types/papaparse": "^5.3"
  }
}
```

## File Aggiuntivi da Creare

- **schema.sql** — DDL completo per creare le tabelle in Supabase + seed operai
- **README.md** — Istruzioni setup semplicissime per utente non tecnico
- **.env.example** — Template variabili d'ambiente
- **.gitignore** — Node modules, .env, dist, .superpowers

## Note Implementative

- Usare la skill `frontend-design` durante l'implementazione per UI di alta qualità
- Mobile-first: progettare prima per 375px, poi espandere per desktop
- Upsert per incassi: ON CONFLICT (date) DO UPDATE
- Date in formato italiano (DD/MM/YYYY) nell'UI, ISO nel DB
- Numeri formattati all'italiana (1.250,00) nell'UI
- I giorni della settimana lavorativa sono lun-sab (no domenica)
- Il tema (light/dark) viene salvato in localStorage
- La dashboard calcola il totale spese aggregando sia `expenses` che `salary_payments`
- L'app deve essere 100% pronta all'uso: il deploy su Vercel + schema SQL su Supabase devono bastare
- Il README deve guidare un utente non tecnico passo-passo (screenshot-style)
- Testare tutti i flussi CRUD, export, grafici, responsive prima di consegnare
- Le credenziali Supabase vanno configurate come env vars su Vercel (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
