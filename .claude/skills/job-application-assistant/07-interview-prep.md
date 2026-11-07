---
framework_version: 1.0.0
---

# Interview Preparation Guide

<!-- SETUP: STAR examples are personalized by running /setup based on your actual experience -->

## STAR Format

Structure answers as: **Situation** (context), **Task** (your responsibility), **Action** (what you did), **Result** (outcome).

Keep answers to 1-2 minutes. Be specific. End with what you learned or would do differently.

## Ready-Made STAR Examples

<!-- Add more STAR examples as needed. Aim for 4-6 covering different competencies. -->

### Rust microservice extraction - Policy Management domain (Prima Assicurazioni)
**Source:** CV/LinkedIn - Senior Software Engineer, Prima Assicurazioni
**Why it matters:** Leadership on a migration/extraction project, technical ownership, cross-team coordination.
**Use for:** "Tell me about a time you led a technical migration", "How do you approach breaking up a monolith?", "Describe a time you had to coordinate across teams"

- **Situation:** Many different teams worked on the same giant monolith, overlapping and conflicting with each other's work and blocking each other's deployments. The project had become too large to handle as a single unit, and setup time for newcomers had grown too long.
- **Task:** As an experienced developer who had built a large part of the original monolith - and so had the context to know what should and shouldn't be extracted - I was responsible for leading the extraction of the Policy Management domain our team owned.
- **Action:** Built a new project from the ground up with my team, setting up the necessary infrastructure with help from DevOps and isolating it from the original system. The new service was dedicated exclusively to managing the lifecycle of motor policies in Spain. We then defined a gRPC contract that clearly stated what operations other teams were allowed to perform on a policy.
- **Result:** A successful microservice that sped up our team, letting us deploy features faster without depending on other teams. Maintainability increased and compile times decreased, simplifying the day-to-day developer experience.

### Internal gRPC adoption (Prima Assicurazioni)
**Source:** CV/LinkedIn - Senior Software Engineer, Prima Assicurazioni
**Why it matters:** Driving a technical standard across teams, cross-language API design, observability practices.
**Use for:** "Tell me about a time you introduced a new technical standard", "How do you drive adoption of a change across teams you don't manage?", "Describe an API design decision you made"

- **Situation:** My team was using GraphQL for machine-to-machine communication and REST APIs, which caused unexpected backward/forward-compatibility issues whenever we updated our APIs. Since our APIs were consumed by many teams across the company, it became difficult to keep track of every consumer and the risk of breaking someone downstream.
- **Task:** As the one pioneering the shift, I was responsible for introducing gRPC and Protobuf as the new standard and making it easy and safe for other teams to adopt.
- **Action:** I moved us to gRPC with Protobuf, which solves backward/forward-compatibility issues by design, and packaged the generated gRPC code as versioned libraries (published for both Rust and Elixir, our two main stacks). This made rolling out new versions of the API more structured and methodical, with consuming teams notified on every update. The generated typed code let teams integrate with confidence and doubled as near-automatic, clear documentation.
- **Result:** Smoother, safer API evolution across the company - clearer versioning, far fewer compatibility breakages, and faster onboarding for teams consuming our APIs.

### Installment scheduler backend (Prima Assicurazioni)
**Source:** CV/LinkedIn - Senior Software Engineer, Prima Assicurazioni
**Why it matters:** End-to-end ownership of a customer-facing feature, architectural decision-making, functional design practices, observability.
**Use for:** "Tell me about a feature you owned end-to-end", "Describe an architectural decision you're proud of", "How do you design for maintainability?"

- **Situation:** Customers wanted a way to pay their policies in installments instead of all at once. Business picked up the request and raised it to engineering. The dedicated payments team didn't have the capacity to take it on at the time, so it was assigned to my team instead.
- **Task:** I personally led the architectural design of what we called the "installment scheduler."
- **Action:** I designed it as a highly modular system, with its core logic implemented as a pure state machine with clear state definitions - easy to debug, understand, maintain, and test. I also built in high observability from the start, instrumenting it with OpenTelemetry and using Datadog to quickly catch and diagnose any issues.
- **Result:** It has been in production since this summer with very few bugs arising - I consider it one of my success stories.

### Armore App distributed backend (Security Union)
**Source:** CV/LinkedIn - Backend Engineer, Security Union
**Why it matters:** Building production systems at scale, security-sensitive design, open source contribution.
**Use for:** "Tell me about a security-sensitive system you built", "Describe your experience with real-time/P2P systems", "Tell me about an open source project you contributed to"

- **Situation:** A small team based in Ann Arbor was building a real-time position-tracking app, similar to Apple's Find My, to let people track family and friends and quickly send an alert if they were in danger - a rapid danger-reporting and help-request app.
- **Task:** I joined as a Rust backend developer, responsible for the distributed backend services and for working with end-to-end encrypted peer-to-peer communication.
- **Action:** I worked with E2E encrypted peer-to-peer communication protocols such as WebRTC, and designed and implemented the distributed backend (Rust, TypeScript, Redis, RabbitMQ, Postgres), including an asynchronous user invitations system.
- **Result:** The app shipped as open source and reached over 10,000 users.

### Arca firmware (personal project)
**Source:** Independent project, 2024-2025 (https://arca.bot/) - collaboration with Arca's founders
**Why it matters:** Embedded/IoT experience, self-directed project ownership, adoption of bleeding-edge tooling, learning a new domain fast.
**Use for:** "Tell me about a project outside of work", "Describe a time you learned a new technology quickly", "Tell me about your embedded/IoT experience"

- **Situation:** A friend of mine, a senior and experienced Elixir developer, was the founder behind a smart-locker project. He wanted to build lockers that are easy and cheap to deploy, update, and repair, unlike the big, heavy lockers companies like DHL or Amazon produce. The lockers run on solar panels and report real-time state to a server; each one can be controlled and monitored remotely and is fully integrated with a web service so users can track their packages online.
- **Task:** I joined as an Elixir developer on the firmware.
- **Action:** I completely refactored the initial firmware codebase to be more efficient and easier to test and maintain. I also helped with communication with the NervesCloud team and led the integration with NervesCloud to provide on-the-fly updates to each locker. I learned Nerves from scratch along the way, and kept my own Arca locker circuit board at home to run local tests.
- **Result:** The project succeeded - the lockers have been in use in Barcelona for some time, with the company focused on logistics and using the lockers as a medium for package delivery.

## Common Tough Questions

### "Why did you leave [previous company]?"
> [PREPARE YOUR ANSWER - be honest, forward-looking, no negativity about former employer]

### "You don't have [specific skill/experience]."
> [PREPARE YOUR ANSWER - acknowledge the gap, bridge to adjacent experience, show willingness to learn]

### "Where do you see yourself in 5 years?"
> [PREPARE YOUR ANSWER - show ambition aligned with the role's growth path]

### "What's your biggest weakness?"
> [PREPARE YOUR ANSWER - genuine weakness with concrete mitigation strategy]

### "Why this company specifically?"
> Customize per company. Must reference: specific projects, company values, market position, or team structure. Never give a generic answer.

## Questions You Should Ask Interviewers

### About the Role
- "What does a typical week look like in this role?"
- "What would success look like in the first 6 months?"
- "What's the biggest challenge the team is facing right now?"

### About the Team
- "How big is the team, and how do you divide work?"
- "What does the development/project lifecycle look like, from idea to production?"
- "How do you onboard new team members?"

### About Tech & Growth
- "What's your current tech stack for [relevant area]?"
- "Is there room to grow into more architectural or strategic decisions?"
- "How does the team stay current with new tools and methods?"

### About Culture (use these to prevent disappointment)
- "How would you describe the team culture?"
- "What does professional development look like here?"
- "Is there flexibility for remote/hybrid work?"
- "What's the balance between development/new projects and maintenance work?"
- "How would you describe the leadership style in this team?"
- "What do people who thrive here have in common?"

## Phone/Video Interview Tips
- Have STAR examples written out (use this file)
- Keep a glass of water nearby
- Smile when speaking (it changes your tone)
- Ask for clarification if a question is vague
- It's OK to take 5 seconds to think before answering
- End with: "Is there anything else you'd like to know about my background?"

## After the Application (Best Practice)

### Follow-Up Etiquette
- **Don't call to "stand out"** or to learn more about the role post-submission - this risks a negative impression
- If the employer specified a timeline, respect it and wait
- If no timeline was given and significant time has passed (2+ weeks), a brief call to ask about status is acceptable
- If you have genuinely new, relevant information to share, a short follow-up is fine

### Thank-You Notes
- When you receive any update (interview invitation, rejection, or status update), send a brief thank-you message
- Express appreciation for their time and the process
- Keep it short (2-3 sentences)

## Roleplay Guidelines
When the user asks for interview practice:
1. Ask which role/company to simulate
2. Start with easy warm-up questions ("Tell me about yourself")
3. Progress to role-specific technical questions
4. Include 1-2 behavioral questions using the competencies from the job posting
5. End with a tough question or curveball
6. After each answer, give brief feedback: what worked, what to sharpen
7. Suggest which STAR example would work best for each question
