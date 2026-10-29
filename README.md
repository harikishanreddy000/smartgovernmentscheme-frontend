# Sahaaya government scheme checker

A responsive React/Vite eligibility-discovery frontend for Indian government schemes. It connects to the Spring Boot API in `../backend/smart-government-scheme`.

## Run locally

From this directory:

```sh
npm install
npm run dev
```

Start the API from `../backend/smart-government-scheme` with `./mvnw spring-boot:run`, then run the Vite app from this directory with `npm install` and `npm run dev`. Open the Vite URL printed in the terminal (normally `http://localhost:5173`).

## About the eligibility preview

The frontend loads the catalogue from `GET /api/schemes` and submits the questionnaire to `POST /api/eligibility/check`. Configure a different API origin with `VITE_API_BASE_URL` at build/dev time. The backend defaults to `http://localhost:8080` and allows the frontend at `http://localhost:5173` by default. Set `FRONTEND_ORIGIN` on the backend if the frontend origin differs.

The sample backend processes each profile in memory for that request only and does not store it. The returned matches are informational screening, not official eligibility decisions; verify current criteria, availability, and applications at linked government portals. Catalogue fallback data is used only if the API cannot be reached, and the UI displays an offline notice.

## Included

- Responsive citizen-portal dashboard and two-step eligibility questionnaire.
- Backend-powered screening for a small sample of central schemes, with transparent match/review labels.
- Searchable, category-filtered scheme catalogue, official source links, and saved shortlist.
- Privacy, eligibility, and information-accuracy disclaimers throughout.

The saved shortlist is stored in this browser's local storage; questionnaire answers are sent to the API for screening but are not stored by the sample backend.

## Checks

- `npm run build` — production build
- `npm run lint` — Oxlint
