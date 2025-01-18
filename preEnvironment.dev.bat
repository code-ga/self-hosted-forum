docker run -d --rm --name postgres -p 5432:5432 -e POSTGRES_PASSWORD=password -v ./data:/var/lib/postgresql/data postgres:alpine
cd backend
bun install && bun x drizzle-kit push