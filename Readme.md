# Self hosted forum
# Feature
- can comment and post 
- have rich text editor
# How to host
- 0. prepare env

have something like docker compose and computer the github and discord account (optional). fill all in `src/backend/.env` with the example in `src/backend/.env.example`
- 1. deploy the backend
```bash
export POSTGRES_PASSWORD=""
export POSTGRES_USER=""
export POSTGRES_DB=""
export PORT=
docker compose up -d --build
```
- 2. expose the port or something like cf tunnel
- 3 deploy the frontend and change url in `frontend\app\libs\auth-client.ts` and `frontend\app\libs\client.ts`