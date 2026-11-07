---
framework_version: 1.1.1
---

# Candidate Profile

<!-- SETUP: This file is populated by running /setup -->
<!-- After running /setup, all sections will be filled with your actual information -->

## Identity
- **Name:** Alex Morgan
- **Nationality:** Spanish
- **Location:** Palermo, Italy
- **Phone:** +1 555-0100
- **Email:** alex.morgan@example.com
- **LinkedIn:** https://linkedin.com/in/jaster-victor
- **GitHub:** https://github.com/JasterV
- **Website:** https://jaster.xyz
- **Status:** Employed (Senior Software Engineer at Prima Assicurazioni)
- **Constraints:** Remote only - not open to relocation
- **Work arrangement:** Open to freelance/B2B contracts in addition to standard employee contracts, including invoicing a Spanish company while tax-resident in Italy - confirmed compliant with his accountant. Willing to self-fund any required travel to Spain.

### Languages
<!-- Every language you can work in professionally, with your honest level. Used by the
Language Gate in 04-job-evaluation.md and by job-scraper/search-queries.md's query-language
generation. Omit any language you don't actually work in - an undeclared language is treated as
a hard no, not a gap to smooth over. -->

| Language | Level | Notes |
|----------|-------|-------|
| Spanish | Native | |
| Catalan | Native | |
| English | Native | |
| Italian | Fluent | |

## Education

| Degree | Period | Institution | Key Topics |
|--------|--------|-------------|------------|
| Bootcamp in Software Engineering (Backend) | Jun 2020 - Feb 2021 | Assembler Institute of Technology | Specialized in back-end development, worked on 20+ real-world problems using current technologies |
| Bachelor's in Computer Science (uncompleted, 2 of 4 years) | Sep 2018 - May 2020 | Universitat de Lleida | Data Structures, Algorithms, Mathematics (completed with certification of honor) |

## Professional Experience

### Senior Software Engineer - Prima Assicurazioni (Jun 2022 - Current)
Remote
- Led the development of an installment scheduler backend enabling customers to split policy payments into monthly rates, built entirely in Rust using Apalis for job scheduling and Postgres as the backend, with a declarative, pure-functional core implemented as a state machine following a hexagonal architecture
- Led the extraction of the Policy Management domain from a legacy monolith into a dedicated Rust microservice, overseeing CI/CD, gRPC APIs, and cross-domain integrations
- Pioneered internal gRPC adoption; defined Protobuf APIs, published Rust and Elixir libraries, and implemented services with tracing, reflection, and integration testing
- Contributed to the extraction of disclosure services using Kafka to manage asynchronous communication with 3rd-party systems
- Maintained full-stack services for the Claims Payments domain using Elixir (CQRS & Event Sourcing) and Rust (anti-corruption layers) for 3rd-party API integrations
- Led the rebuild of a distributed email ingestion engine using Rust, Postgres, and RabbitMQ; applied hexagonal architecture and implemented high-resolution observability (tracing/metrics) via Datadog
- Contributed to the Spanish product launch (Rust/GraphQL/Elm) and introduced automated testing frameworks for Elixir LiveView and Elm

### Full Stack Developer - TalentBait (Sep 2021 - Jun 2022)
Remote (based in Barcelona, Spain)
- Designed and developed scalable software with Node.js and Firebase in an agile, product-centric environment
- Responsible for critical 3rd-party API integrations, with a strong focus on resilience and security
- Led the transition from a legacy monolith to a microservices architecture while maintaining and scaling it
- Improved the maintainability of the legacy codebase and introduced integration testing for web APIs
- Introduced system-wide monitoring with Datadog

### Backend Engineer - Security Union (Nov 2020 - Sep 2021)
Remote
- Armore App (+10k users, E2E encrypted location sharing app, open source): designed and implemented distributed backend services using Rust, TypeScript, Redis, RabbitMQ & Postgres; built an asynchronous user invitations system critical to the user experience
- Remote Shutter (P2P remote-control camera app): built state management for a Flutter app with ReactiveX using an event-driven architecture to communicate across the app's components

### Fullstack Developer - Solve The X (Mar 2021 - Aug 2021)
Barcelona, Spain
- Migrated legacy REST APIs (PHP/MySQL) to GraphQL backed by Postgres, providing efficient server-side rendered content
- Built an asynchronous email notification service using TypeScript and RabbitMQ, contributing to CI automation via GitHub Actions
- Enhanced system reliability by introducing Sentry for metrics/logging and implementing automated E2E and UI testing

## Independent Projects
<!-- Projects outside of employment: freelance, open source, personal -->
- **Arca** (2024-2025, https://arca.bot/): Built the firmware for a smart locker system, synchronizing state between the lockers' hardware and the server. The firmware controlled every locker action - locking, unlocking, lights, doors, and a motion-based alarm system - built entirely with the Nerves framework. Built the companion web app with Ash, Phoenix, and LiveView, and worked with NervesCloud on on-the-fly firmware updates as one of its first Beta adopters

## Technical Skills

### Programming & ML
- **Rust** (Primary): Async web development with the Tokio ecosystem (Tokio, Tower, Tonic, Axum), Apalis, gRPC/Protobuf, hexagonal architecture, CQRS/anti-corruption layers
- **Elixir** (Primary): OTP, Phoenix, LiveView, Ash, Nerves, CQRS & Event Sourcing
- **TypeScript/Node.js** (Primary): RabbitMQ-based services, Firebase
- GraphQL, Kafka, RabbitMQ, Postgres, Kubernetes, AWS, Flutter/Dart, Elm (frontend)

### Domain Expertise
- Distributed systems and microservices extraction from legacy monoliths
- Event-driven architecture and observability (tracing/metrics)
- Embedded/IoT firmware (BEAM-based, Nerves)
- Cloud infrastructure (Kubernetes, AWS)

### Software & Tools
- Datadog, Sentry, GitHub Actions, Docker

## Certifications
- Dart and Flutter: The Complete Developer's Guide
- Elixir and Phoenix: Real World Functional Programming
- The Ultimate JavaScript Mastery Series
- Python (Basic) Certificate

## Publications
<!-- List peer-reviewed publications, if any -->
1. [AUTHOR_LIST] ([YEAR]). [TITLE]. [JOURNAL]. [DOI_LINK]

## Awards
- [AWARD] - [EVENT] ([YEAR])

## References
- [NAME], [TITLE], [COMPANY] ([EMAIL], [PHONE])

More references available upon request.
