# Macelleria Gianluca — Gestionale Spese

Gestionale spese per macelleria. Registra incassi giornalieri, spese per categoria, stipendi operai. Dashboard con grafici e export in CSV/Excel.

## Setup (5 minuti)

### 1. Database (Supabase)

1. Vai su [supabase.com](https://supabase.com) e accedi al tuo progetto
2. Clicca **SQL Editor** nel menu a sinistra
3. Clicca **New query**
4. Copia e incolla TUTTO il contenuto del file `schema.sql` di questo progetto
5. Clicca **Run** (il bottone verde)
6. Dovresti vedere "Success" — le tabelle sono create!

### 2. Deploy (Vercel)

1. Vai su [vercel.com](https://vercel.com) e accedi
2. Clicca **Add New > Project**
3. Importa il repository da GitHub
4. Prima di cliccare Deploy, vai in **Environment Variables** e aggiungi queste due variabili:

| Nome | Valore |
|------|--------|
| `VITE_SUPABASE_URL` | L'URL del progetto Supabase (es: `https://xxxxx.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | La chiave "anon/public" da Supabase > Settings > API |

5. Clicca **Deploy**
6. Attendi 1-2 minuti. Quando vedi "Ready", clicca il link per aprire l'app!

### 3. Usa l'app

- **Incassi** (pagina principale): Inserisci cassa e POS del giorno
- **Spese**: Aggiungi spese per categoria (fornitori, gestione, ecc.)
- **Dashboard**: Vedi grafici e riepiloghi giorno/settimana/mese
- **Fornitori**: Controlla quanto hai speso per ogni fornitore
- **Altro**: Gestisci operai, stipendi, e scarica report in Excel

## Sviluppo locale

```bash
npm install
cp .env.example .env   # poi inserisci le tue credenziali Supabase
npm run dev
```

## Tecnologie

- React + TypeScript + Vite
- TailwindCSS (tema chiaro/scuro)
- Supabase (database PostgreSQL)
- Recharts (grafici)
- Deploy su Vercel
