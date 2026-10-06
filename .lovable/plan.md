# Smart Metro — Spring Boot Microservices Breakdown (Example)

## Context

Today the app is a modular monolith: one React frontend + one Supabase backend (Postgres + edge functions). This plan shows how the **same product** would be divided into independent Spring Boot microservices — one per business capability — if we ever rebuild the backend in Java.

## Proposed service split

```text
                        ┌─────────────────┐
                        │  React Frontend │  (unchanged — calls API Gateway)
                        └────────┬────────┘
                                 ▼
                        ┌─────────────────┐
                        │   API Gateway    │  Spring Cloud Gateway
                        │ (routing, auth)  │  + JWT validation
                        └────────┬────────┘
        ┌──────────┬───────────┼───────────┬──────────┬──────────┐
        ▼          ▼           ▼           ▼          ▼          ▼
   ┌────────┐ ┌────────┐ ┌─────────┐ ┌────────┐ ┌────────┐ ┌─────────┐
   │ User & │ │ Ticket │ │ Wallet  │ │ Smart  │ │Parking │ │ Journey │
   │ Auth   │ │Booking │ │Payment  │ │ Card   │ │Service │ │Planner  │
   │Service │ │Service │ │Service  │ │Service │ │        │ │Service  │
   └───┬────┘ └───┬────┘ └────┬────┘ └───┬────┘ └───┬────┘ └────┬────┘
       │          │           │          │          │           │
   own DB      own DB      own DB     own DB     own DB      own DB
 (users)    (tickets)  (wallets,  (smart_    (parking_   (routes,
                        txns)     cards)      bookings)   stations)

   ┌────────┐ ┌─────────┐ ┌──────────┐ ┌───────────┐ ┌────────────┐
   │Lost &  │ │Food     │ │Volunteer/│ │Notification│ │AI Chatbot │
   │Found   │ │Stalls   │ │Accessib. │ │Service     │ │Service    │
   │Service │ │Service  │ │Service   │ │(email/push)│ │(calls LLM)│
   └────────┘ └─────────┘ └──────────┘ └───────────┘ └────────────┘
```

## Example: one service in detail — Wallet Service

- **Spring Boot app** `wallet-service` with its own Postgres schema
- REST endpoints: `GET /wallet/balance`, `POST /wallet/topup`, `POST /wallet/pay`, `GET /wallet/transactions`
- Publishes event `WalletDebited` to a message broker (Kafka/RabbitMQ) so Ticket Service can confirm a booking
- Other services never touch its database — they call its API or listen to its events

## How services talk to each other

- **Synchronous:** REST via API Gateway (e.g. Booking Service → Wallet Service: "deduct ₹40")
- **Asynchronous:** events via Kafka (e.g. `TicketBooked` → Notification Service sends confirmation)
- **Auth:** one Auth Service issues JWT tokens; every other service just validates them

## Mapping current features → services

| Current feature (React page) | Microservice | Own tables |
|---|---|---|
| Booking / Offline Tickets | Ticket Service | tickets, offline_tickets |
| Wallet / Time Wallet | Wallet Service | wallets, wallet_transactions |
| Smart Card / Virtual E-Card | Smart Card Service | smart_cards |
| Smart Parking | Parking Service | parking_bookings |
| Live Arrivals / Journey Planner | Journey Service | stations, routes, arrivals |
| Lost & Found | Lost & Found Service | lost_items |
| Food Stalls | Food Service | stalls, orders |
| Volunteer / Accessibility | Volunteer Service | volunteers, assistance_requests |
| AI Chatbot | Chatbot Service | (calls LLM gateway) |
| Login / Profile | User & Auth Service | users, profiles |

## Key principles (what makes this "microservices")

1. **One service = one business capability**, with its own database
2. **No shared tables** — services communicate via APIs/events only
3. **Independent deployment** — update Wallet Service without touching Ticket Service
4. **API Gateway** as the single entry point for the React frontend
5. **Service discovery + config** via Spring Cloud (Eureka/Config Server)

## Scope note

This is an explanatory design only — no code changes. Actually rebuilding the backend in Spring Boot would be a large separate effort (new Java project, database migration away from Supabase, auth rewrite). Say the word if you want that planned for real.
