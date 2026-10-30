# ShopMate AI

**ShopMate AI** is a planned AI-powered shopping platform that helps
customers discover, compare, and choose products using natural-language
conversations. The platform is designed to support text and voice input,
multilingual interactions, budget-aware recommendations, seller-managed
products, and a secure checkout flow for products sold directly on the
platform.

> **Project status:** Architecture and implementation plan. Features
> described in this README are planned unless they have been implemented
> and tested in the codebase. Do not treat this document as proof that
> an integration, API, agent, or payment flow is already working.

------------------------------------------------------------------------

## 1. Project Vision

Shopping websites often require users to search with exact product names
and manually compare many listings. ShopMate AI aims to make this
process easier.

A customer should be able to say something like:

> "I need a laptop under ₹50,000 for programming and college."

The system should then:

1.  Understand the customer's request.
2.  Extract details such as product category, budget, purpose, and
    preferences.
3.  Search the available product catalogue.
4.  Filter products using actual price, availability, and product
    attributes.
5.  Recommend and compare suitable products.
6.  Explain why each result matches the request.
7.  Let the customer open an external marketplace listing or add an
    eligible ShopMate seller product to the cart.
8.  Support a secure checkout for orders placed on ShopMate AI.

The AI must explain and organize verified information. It must not
invent product listings, prices, discounts, stock availability, ratings,
or delivery dates.

------------------------------------------------------------------------

## 2. Main Objectives

-   Provide a conversational shopping experience.
-   Accept natural-language requests in English, Hindi, and Marathi,
    with voice support planned.
-   Extract shopping requirements from user messages.
-   Search a real product database rather than relying on generated
    product claims.
-   Recommend products according to budget and user preferences.
-   Compare products using consistent attributes.
-   Support customers, associates/sellers, and administrators.
-   Keep external marketplace purchases separate from ShopMate's own
    checkout.
-   Provide secure authentication, authorization, cart, order, and
    payment workflows.
-   Keep AI provider integrations replaceable through a model registry.

------------------------------------------------------------------------

## 3. User Roles

### Customer

-   Register and sign in.
-   Chat with the AI shopping assistant.
-   Search and view products.
-   Receive recommendations and comparisons.
-   Save favourites or wishlist items.
-   Manage their cart.
-   Place and track orders for products sold through ShopMate AI.
-   Review purchased products.

### Associate / Seller

-   Register or apply as a seller, subject to platform approval.
-   Create and manage product listings.
-   Update product descriptions, prices, stock, and images.
-   View orders related to their products.
-   Manage fulfilment information, according to the platform's seller
    rules.

### Admin

-   Manage users, sellers, products, categories, and platform content.
-   Review and approve seller accounts or listings.
-   Monitor orders, payments, reports, and support issues.
-   Manage offers and platform settings.
-   Review audit and security events.

### Designer (Future Scope)

-   Create or upload fashion designs.
-   Publish designs or services.
-   Receive customer enquiries and custom-order requests.
-   Manage quotes and design-related orders.

------------------------------------------------------------------------

## 4. Shopping Flows

### Flow A: External Marketplace Product

1.  Customer describes what they need.
2.  AI extracts the requirements.
3.  The backend searches product sources that are actually integrated
    and available.
4.  ShopMate displays verified product information and the source.
5.  Customer selects an external product link.
6.  The customer completes the purchase on that external marketplace.

**Important:** ShopMate AI does not control the external marketplace
checkout. A ShopMate PayPal payment must not be presented as payment for
an order placed on another marketplace.

### Flow B: ShopMate Seller Product

1.  A seller publishes a product on ShopMate AI.
2.  The backend stores its product details, price, and stock.
3.  The customer discovers the product through search or the AI
    assistant.
4.  The customer adds it to the ShopMate cart.
5.  The backend validates the current product price and stock.
6.  The customer proceeds to checkout.
7.  The payment provider processes the payment.
8.  The backend verifies the payment before marking the order as paid.

------------------------------------------------------------------------

## 5. Proposed Technology Stack

  -----------------------------------------------------------------------
  Layer                   Planned technology      Responsibility
  ----------------------- ----------------------- -----------------------
  Frontend                React, Vite             Customer and dashboard
                                                  interfaces

  Styling                 Tailwind CSS            Responsive UI styling

  Animation               Framer Motion           Interface transitions
                                                  and animations

  Backend                 Node.js, Express.js     APIs, authentication,
                                                  business logic

  Database                MongoDB, Mongoose       Users, products, carts,
                                                  orders, and related
                                                  data

  AI providers            Groq, Gemini, OpenAI,   Language-model
                          Ollama                  inference

  AI orchestration        LangGraph.js            Coordinating multi-step
                                                  AI workflows

  AI utilities            LangChain.js, Zod       Model/tool integrations
                                                  and data validation

  Retrieval               MongoDB Vector Search   Semantic retrieval for
                          (planned)               suitable knowledge
                                                  content

  Authentication          JWT and role-based      Authentication and
                          access control          permissions

  Image storage           Cloudinary (planned)    Product and design
                                                  images

  Payments                PayPal (planned)        Payments for eligible
                                                  ShopMate orders

  Voice                   Web Speech API          Browser speech
                          (planned)               recognition and speech
                                                  synthesis
  -----------------------------------------------------------------------

The stack is a design proposal. Install and integrate each dependency
only when its phase is being implemented.

------------------------------------------------------------------------

## 6. High-Level Architecture

``` text
Customer / Associate / Admin
            |
            v
     React Frontend
            |
            v
     Express Backend API
            |
     +------+----------------------+
     |                             |
     v                             v
MongoDB Database              AI Engine
     |                             |
     |                    Agent Orchestrator
     |                             |
     |              +--------------+--------------+
     |              |              |              |
     |          Shopping       Budget        Comparison
     |           Agent          Agent           Agent
     |              |              |              |
     |              +--------------+--------------+
     |                             |
     |                       AI Tools
     |                 Product Search / Compare
     |                 Price / Cart / Orders
     |                             |
     |                       Model Registry
     |                             |
     |                 Groq / Gemini / OpenAI
     |                       / Ollama
     |
     +---- Products / Users / Carts / Orders
```

The backend is responsible for authorization, validation, database
access, and business rules. The AI Engine helps interpret requests and
coordinate allowed tools. AI-generated text must not bypass backend
checks.

------------------------------------------------------------------------

## 7. Repository Structure

The proposed repository structure is:

``` text
ShopMate-AI/
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── pages/
│       ├── layouts/
│       ├── services/
│       ├── hooks/
│       ├── context/
│       └── App.jsx
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── server.js
│
├── ai-engine/
│   ├── models/
│   │   ├── llm/
│   │   │   ├── groqModel.js
│   │   │   ├── ollamaModel.js
│   │   │   ├── openaiModel.js
│   │   │   ├── geminiModel.js
│   │   │   └── modelRegistry.js
│   │   ├── embeddings/
│   │   │   ├── embeddingService.js
│   │   │   └── vectorSearch.js
│   │   └── vision/
│   │       └── imageUnderstanding.js
│   │
│   ├── agents/
│   │   ├── orchestrator/
│   │   │   └── agentOrchestrator.js
│   │   ├── shoppingAgent/
│   │   │   └── shoppingAgent.js
│   │   ├── recommendationAgent/
│   │   │   └── recommendationAgent.js
│   │   ├── comparisonAgent/
│   │   │   └── comparisonAgent.js
│   │   ├── budgetAgent/
│   │   │   └── budgetAgent.js
│   │   ├── fashionAgent/
│   │   │   └── fashionAgent.js
│   │   └── supportAgent/
│   │       └── supportAgent.js
│   │
│   ├── tools/
│   │   ├── productSearchTool.js
│   │   ├── productCompareTool.js
│   │   ├── priceCheckTool.js
│   │   ├── cartTool.js
│   │   ├── orderTrackingTool.js
│   │   └── offerSearchTool.js
│   │
│   ├── rag/
│   │   ├── documentLoader.js
│   │   ├── textSplitter.js
│   │   ├── vectorStore.js
│   │   └── retrievalService.js
│   │
│   ├── memory/
│   │   ├── conversationMemory.js
│   │   ├── userPreferenceMemory.js
│   │   └── sessionMemory.js
│   │
│   ├── prompts/
│   │   ├── systemPrompt.js
│   │   ├── shoppingPrompt.js
│   │   ├── recommendationPrompt.js
│   │   └── comparisonPrompt.js
│   │
│   ├── workflows/
│   │   ├── shoppingWorkflow.js
│   │   ├── recommendationWorkflow.js
│   │   └── checkoutWorkflow.js
│   │
│   ├── evaluation/
│   │   ├── responseEvaluator.js
│   │   └── recommendationEvaluator.js
│   │
│   ├── config/
│   │   └── aiConfig.js
│   ├── index.js
│   ├── docs/
│   ├── .env.example
│   ├── .gitignore
│   └── package.json
│
├── docs/
│   ├── architecture/
│   ├── api/
│   └── planning/
│
├── .gitignore
└── README.md
```

This is a target structure, not a requirement to create every file at
the beginning. Start with the minimum files needed for the first working
feature and expand as each phase is completed.

------------------------------------------------------------------------

## 8. AI Engine Design

### 8.1 Model Providers

The model registry should provide one consistent interface for calling
different providers.

Planned adapters:

-   `groqModel.js` --- Groq API integration.
-   `geminiModel.js` --- Google Gemini API integration.
-   `openaiModel.js` --- OpenAI API integration.
-   `ollamaModel.js` --- locally hosted Ollama models.
-   `modelRegistry.js` --- selects the configured provider.

Start with one provider, such as Groq. Add other providers only after
the first provider works. Model IDs should be configurable through
environment variables and checked against the provider's currently
available models.

### 8.2 Agents

Agents are focused software modules or workflows. They do not need to be
separate paid language models.

  -----------------------------------------------------------------------
  Agent                               Responsibility
  ----------------------------------- -----------------------------------
  Shopping Agent                      Understand the shopping request and
                                      coordinate product discovery

  Recommendation Agent                Rank real matching products and
                                      explain the ranking

  Comparison Agent                    Compare selected products using
                                      verified attributes

  Budget Agent                        Apply budget constraints and
                                      explain trade-offs

  Fashion Agent                       Future feature for fashion-related
                                      discovery and design workflows

  Support Agent                       Answer questions using approved
                                      support and policy information

  Orchestrator                        Decide which workflow or tool
                                      should run next
  -----------------------------------------------------------------------

For the MVP, these agents can be ordinary JavaScript functions that call
a shared model and approved backend tools. Introduce LangGraph when the
workflow has multiple steps or branching decisions.

### 8.3 Tools

Tools perform specific, controlled operations:

-   `productSearchTool.js` --- search the real product catalogue.
-   `productCompareTool.js` --- compare products from verified data.
-   `priceCheckTool.js` --- retrieve current stored or provider-supplied
    price data.
-   `cartTool.js` --- perform authorized cart operations.
-   `orderTrackingTool.js` --- retrieve the signed-in user's order
    status.
-   `offerSearchTool.js` --- retrieve valid offers from trusted stored
    or integrated sources.

Every tool must validate its inputs and permissions. User-specific tools
must enforce ownership and role checks in the backend.

### 8.4 RAG and Knowledge Retrieval

Retrieval-Augmented Generation (RAG) may be used for relatively stable
knowledge such as:

-   Shipping and return policies.
-   Product manuals and documentation.
-   Platform FAQs.
-   Seller guidelines.
-   Support documentation.

Live prices, stock, order status, and payment status must be fetched
from the authoritative database or relevant verified service---not from
old vector-indexed text.

### 8.5 Memory

Planned memory types:

-   Session memory --- temporary state for the current shopping
    conversation.
-   Conversation memory --- relevant conversation history.
-   User preference memory --- preferences the customer has chosen to
    save.

Memory must have clear retention and deletion rules. Do not store
sensitive payment credentials or unnecessary personal information in AI
prompts or conversation memory.

------------------------------------------------------------------------

## 9. Planned Backend API

The following is a proposed API contract. Endpoints should be
implemented and tested incrementally.

### AI APIs

  -----------------------------------------------------------------------
  Method                  Endpoint                Purpose
  ----------------------- ----------------------- -----------------------
  POST                    `/api/ai/chat`          Send a message to the
                                                  shopping assistant

  POST                    `/api/ai/search`        Search products from a
                                                  natural-language
                                                  request

  POST                    `/api/ai/recommend`     Get recommendations for
                                                  supplied requirements

  POST                    `/api/ai/compare`       Compare selected
                                                  product IDs
  -----------------------------------------------------------------------

Example request for chat:

``` json
{
  "message": "Suggest a laptop under 50000 for programming",
  "language": "en"
}
```

Example response shape:

``` json
{
  "success": true,
  "message": "Here are products that match your requirements.",
  "data": {
    "intent": {
      "category": "laptop",
      "budget": 50000,
      "purpose": "programming"
    },
    "products": []
  }
}
```

The empty `products` array above is an example response shape, not a
claim that product search is already implemented.

### Product APIs

  -----------------------------------------------------------------------
  Method                  Endpoint                Purpose
  ----------------------- ----------------------- -----------------------
  GET                     `/api/products`         List and filter
                                                  products

  GET                     `/api/products/:id`     Get product details

  POST                    `/api/products`         Create a product
                                                  (authorized
                                                  seller/admin)

  PATCH                   `/api/products/:id`     Update a product
                                                  (authorized
                                                  owner/admin)

  DELETE                  `/api/products/:id`     Remove or deactivate a
                                                  product (authorized
                                                  admin/owner)
  -----------------------------------------------------------------------

### Cart and Order APIs

  Method   Endpoint                    Purpose
  -------- --------------------------- ---------------------------------------
  GET      `/api/cart`                 Get the signed-in user's cart
  POST     `/api/cart/items`           Add an item
  PATCH    `/api/cart/items/:itemId`   Update item quantity
  DELETE   `/api/cart/items/:itemId`   Remove an item
  POST     `/api/orders`               Create an order from a validated cart
  GET      `/api/orders`               List the signed-in user's orders
  GET      `/api/orders/:id`           Get an authorized order's details

### Payment APIs

  -------------------------------------------------------------------------------
  Method                  Endpoint                        Purpose
  ----------------------- ------------------------------- -----------------------
  POST                    `/api/payments/create-order`    Create a
                                                          payment-provider order
                                                          for a ShopMate order

  POST                    `/api/payments/capture-order`   Capture/confirm payment
                                                          through the provider

  POST                    `/api/payments/webhook`         Receive and verify
                                                          provider webhook events
  -------------------------------------------------------------------------------

Payment routes require provider-side verification. Never trust a price,
total, payment result, or order status sent only by the browser.

------------------------------------------------------------------------

## 10. Proposed MongoDB Collections

  Collection        Purpose
  ----------------- ---------------------------------------------------------
  `users`           Customer and account details
  `associates`      Seller profile and approval details
  `products`        Product information, price, stock, seller, and images
  `categories`      Product categories and subcategories
  `carts`           Customer cart items
  `wishlists`       Saved products
  `orders`          Order items, totals, status, and fulfilment data
  `payments`        Payment-provider references and verified payment status
  `reviews`         Customer product reviews
  `conversations`   Conversation records, subject to privacy rules
  `notifications`   User notifications
  `offers`          Valid platform or seller offers

The exact schema, indexes, validation rules, and relationships should be
designed before production use. Prices and order totals must be
calculated on the server from trusted product records.

------------------------------------------------------------------------

## 11. Security and Trust Requirements

Security is part of the core design, not a final optional step.

1.  Keep all provider API keys on the server.
2.  Add `.env` files to `.gitignore`; commit only safe `.env.example`
    templates.
3.  Validate request bodies with a schema-validation library such as
    Zod.
4.  Use password hashing and secure authentication.
5.  Enforce role-based permissions on every protected route.
6.  Ensure customers can access only their own carts and orders.
7.  Ensure sellers can manage only products and orders they are
    authorized to manage.
8.  Recalculate cart and order totals on the backend.
9.  Check stock again before order creation and fulfilment.
10. Verify payment captures and webhook signatures with the payment
    provider.
11. Do not mark an order as paid merely because the frontend says
    payment succeeded.
12. Require clear customer confirmation before consequential actions
    such as placing an order.
13. Rate-limit sensitive endpoints and validate uploaded files.
14. Avoid sending passwords, payment secrets, or unnecessary personal
    data to language models.
15. Log important administrative and payment events without logging
    secrets.

------------------------------------------------------------------------

## 12. Development Roadmap

Build a small working product first. Do not try to implement every
planned feature in one step.

### Phase 1 --- Project Setup and AI Foundation

-   Verify the repository and folder structure.
-   Initialize the AI Engine package.
-   Configure environment variables safely.
-   Connect one language-model provider.
-   Create a basic prompt and test a model response.

**Milestone:** A local script can send a prompt to the configured model
and receive a response.

### Phase 2 --- Request Understanding

-   Define the shopping intent schema.
-   Extract category, budget, purpose, and preferences.
-   Validate model output.
-   Handle missing or ambiguous information by asking a follow-up
    question.

**Milestone:** A natural-language request becomes validated structured
data.

### Phase 3 --- Product Catalogue

-   Connect the backend to MongoDB.
-   Create product and category schemas.
-   Add sample products for development.
-   Implement product filtering and search.

**Milestone:** An API returns real products from the database.

### Phase 4 --- Shopping Tools and Agents

-   Build product search and comparison tools.
-   Add budget filtering.
-   Add recommendation ranking.
-   Ensure recommendations refer only to returned product records.

**Milestone:** The system can find and compare real catalogue products.

### Phase 5 --- Orchestration

-   Define the workflow state.
-   Connect the relevant agent/tool steps.
-   Add branching for search, comparison, and clarification.
-   Introduce LangGraph if the workflow benefits from graph-based
    orchestration.

**Milestone:** One request can pass through a controlled multi-step
shopping workflow.

### Phase 6 --- Backend API Integration

-   Create Express routes and controllers.
-   Add authentication and authorization middleware.
-   Expose the first AI chat/search endpoints.
-   Test requests and error cases using Postman or an equivalent API
    client.

**Milestone:** The frontend or API client can use the AI shopping
endpoint.

### Phase 7 --- Frontend

-   Build the landing page and product listing.
-   Build the shopping assistant interface.
-   Connect frontend services to backend APIs.
-   Add loading, empty, and error states.
-   Make the interface responsive.

**Milestone:** A user can search and receive product results through the
UI.

### Phase 8 --- Accounts and Dashboards

-   Implement customer account pages.
-   Implement seller product management.
-   Implement admin management views.
-   Enforce role-based access in the backend.

**Milestone:** Each role sees and can use only its permitted features.

### Phase 9 --- Cart, Orders, and Payments

-   Implement cart validation.
-   Create orders from trusted database values.
-   Integrate PayPal sandbox.
-   Verify capture and webhook events.
-   Add order history and status.

**Milestone:** A test customer can complete a verified sandbox purchase
of a ShopMate seller product.

### Phase 10 --- RAG, Memory, Voice, and Additional Models

-   Add policy and FAQ retrieval.
-   Add consent-based preference memory.
-   Add voice input/output.
-   Add Gemini, OpenAI, or Ollama adapters as needed.
-   Add image understanding or fashion features only after defining
    their scope.

**Milestone:** Additional AI capabilities work without weakening the
core shopping flow.

### Phase 11 --- Testing and Deployment

-   Add unit and integration tests.
-   Test permissions and payment failure cases.
-   Add production environment configuration.
-   Deploy frontend, backend, and database securely.
-   Add monitoring, backups, and operational documentation.

**Milestone:** The application is deployed with documented setup and
tested critical workflows.

------------------------------------------------------------------------

## 13. Local Development Setup

Prerequisites:

-   Node.js (use a supported current LTS release).
-   npm.
-   MongoDB local instance or a configured MongoDB deployment.
-   Git.
-   VS Code or another code editor.
-   API credentials for the selected AI provider.

### Suggested setup sequence

The exact commands depend on which folders already exist. From the
repository root:

``` powershell
# Move into the repository
cd path\to\ShopMate-AI

# Inspect the current project structure
tree /F

# Initialize the AI Engine only if it has not already been initialized
cd ai-engine
npm init -y

# Set the package to use JavaScript ES modules
npm pkg set type=module

# Install only the initial AI provider and environment configuration packages
npm install groq-sdk dotenv zod
```

Create an `.env` file inside `ai-engine` locally:

``` env
GROQ_API_KEY=your_private_api_key
GROQ_MODEL=your_currently_supported_model_id
```

Create `.env.example` with placeholder values only:

``` env
GROQ_API_KEY=
GROQ_MODEL=
```

Create or update `.gitignore`:

``` gitignore
node_modules/
.env
.env.*
!.env.example
npm-debug.log*
```

Before committing, verify that no real API key or secret is staged.

> The model ID must be selected from the provider's currently available
> models. Do not assume that an older model ID remains available.

------------------------------------------------------------------------

## 14. Environment Variables

Keep secrets in local environment files or a secure deployment secret
manager.

  Variable                  Used for
  ------------------------- -----------------------------------
  `GROQ_API_KEY`            Groq authentication
  `GROQ_MODEL`              Selected Groq model ID
  `GEMINI_API_KEY`          Gemini authentication, when added
  `OPENAI_API_KEY`          OpenAI authentication, when added
  `MONGODB_URI`             MongoDB connection
  `JWT_SECRET`              Signing application tokens
  `PAYPAL_CLIENT_ID`        PayPal application identifier
  `PAYPAL_CLIENT_SECRET`    PayPal server-side secret
  `PAYPAL_BASE_URL`         PayPal environment endpoint
  `CLOUDINARY_CLOUD_NAME`   Cloudinary account configuration
  `CLOUDINARY_API_KEY`      Cloudinary API key
  `CLOUDINARY_API_SECRET`   Cloudinary secret

Only add variables when the related integration is being implemented.
Never put private keys in frontend environment variables or commit them
to Git.

------------------------------------------------------------------------

## 15. Testing Strategy

Test each layer independently before connecting the whole application.

-   **AI provider test:** confirm that the configured provider returns a
    response.
-   **Intent test:** verify extraction for budget, category, purpose,
    and preferences.
-   **Product search test:** verify that filters return correct database
    records.
-   **Recommendation test:** verify that every recommendation references
    a real product.
-   **Comparison test:** verify that values match stored product data.
-   **API test:** verify success, validation failure, authentication
    failure, and server error cases.
-   **Permission test:** verify customer, seller, and admin access
    boundaries.
-   **Cart test:** verify quantity, stock, price changes, and invalid
    product IDs.
-   **Payment test:** verify successful, failed, cancelled, duplicate,
    and delayed payment events.
-   **Frontend test:** verify loading, empty, error, and successful
    states.

Do not test payment flows with real money during initial development.
Use the payment provider's sandbox environment.

------------------------------------------------------------------------

## 16. MVP Scope

The recommended first release should be intentionally small.

### Include in the first MVP

-   Customer registration and login.
-   A small, real product catalogue stored in MongoDB.
-   Product search and filtering.
-   AI request understanding.
-   Budget-aware recommendations.
-   Basic product comparison.
-   A simple customer-facing shopping assistant.
-   A clear product details page.

### Add after the MVP works

-   Seller and admin dashboards.
-   Wishlist and notifications.
-   Order tracking.
-   PayPal sandbox checkout.
-   RAG and preference memory.
-   Voice interaction.
-   Fashion design marketplace.
-   Multiple model providers and advanced multi-agent workflows.

This order reduces complexity and makes it easier to find and fix
errors.

------------------------------------------------------------------------

## 17. Important Design Decisions

-   **One model can support multiple agents.** Separate agents are
    focused modules and workflows, not necessarily separate model
    deployments.
-   **Backend data is authoritative.** The LLM cannot decide the actual
    price, stock, order status, or payment status.
-   **Search must use real sources.** If a marketplace integration is
    not available, do not imply that live marketplace search is working.
-   **External and internal checkout are different.** External
    marketplace purchases happen on the external site; ShopMate checkout
    applies to ShopMate orders.
-   **Start with one AI provider.** Add provider fallbacks after the
    first integration is stable.
-   **Do not overbuild RAG.** Use it for suitable knowledge documents,
    not as a substitute for live product and order queries.
-   **Build and test incrementally.** Each phase should have a working
    milestone before the next one begins.

------------------------------------------------------------------------

## 18. Documentation and Useful References

Use official documentation when implementing integrations:

-   [Node.js](https://nodejs.org/docs/latest/api/)
-   [Express](https://expressjs.com/)
-   [React](https://react.dev/)
-   [Vite](https://vite.dev/guide/)
-   [MongoDB](https://www.mongodb.com/docs/)
-   [Mongoose](https://mongoosejs.com/docs/)
-   [Groq API](https://console.groq.com/docs)
-   [Google Gemini API](https://ai.google.dev/gemini-api/docs)
-   [OpenAI API](https://platform.openai.com/docs/)
-   [LangGraph.js](https://docs.langchain.com/oss/javascript/langgraph/overview)
-   [MongoDB Vector Search](https://www.mongodb.com/docs/vector-search/)
-   [PayPal Developer](https://developer.paypal.com/docs/)
-   [Cloudinary](https://cloudinary.com/documentation)

------------------------------------------------------------------------

## 19. Contribution and Git Workflow

A simple branch workflow is recommended:

``` text
main
 ├── feature/ai-engine
 ├── feature/backend-api
 ├── feature/frontend-ui
 ├── feature/product-catalogue
 └── feature/payment-integration
```

Suggested workflow:

1.  Pull the latest `main` branch.
2.  Create a feature branch.
3.  Make one focused change.
4.  Run the relevant tests.
5.  Review the changed files and check for secrets.
6.  Commit with a clear message.
7.  Open a pull request and merge after review.

Example commands:

``` powershell
git checkout main
git pull
git checkout -b feature/ai-engine
git status
```

Do not commit `.env`, credentials, private keys, database dumps
containing personal information, or production customer data.

------------------------------------------------------------------------

## 20. Current Status Checklist

Update this checklist as implementation progresses. Do not mark an item
complete until it has been implemented and tested.

-   [ ] Repository structure verified
-   [ ] Frontend initialized
-   [ ] Backend initialized
-   [ ] AI Engine initialized
-   [ ] Environment variables configured securely
-   [ ] First AI provider connection tested
-   [ ] Shopping intent schema implemented
-   [ ] MongoDB connection tested
-   [ ] Product schema and sample catalogue created
-   [ ] Product search API tested
-   [ ] Recommendation logic tested
-   [ ] Product comparison tested
-   [ ] AI chat API tested
-   [ ] Frontend connected to backend
-   [ ] Authentication and role permissions tested
-   [ ] Customer, seller, and admin dashboards implemented
-   [ ] Cart and order workflows tested
-   [ ] PayPal sandbox flow verified
-   [ ] Security and error handling reviewed
-   [ ] Deployment completed

------------------------------------------------------------------------

## License

Choose and add a license before publishing or distributing this project.
Until a license is added, do not assume that others have permission to
reuse, modify, or distribute the code.
