# Notention - A Decentralized Semantic Notebook

Notention is not just another note-taking app. It's a tool for thought designed to build a personal, decentralized knowledge graph. It empowers users to capture, organize, and connect information using a rich semantic structure, seamlessly blending human-readable prose with machine-readable data.

At its core, Notention is built on a powerful idea: the distinction between **real** (observed facts) and **imaginary** (conditional or desired states). This allows you to create notes that are not just static records, but dynamic documents that can be queried, matched, and discovered on a decentralized network.

---

## Core Concepts

### 1. Semantic Notes
Every note in Notention is a document that can contain both unstructured text and structured data. This structured data is embedded directly within the note as inline "widgets," which are both easy to read and parseable by machines.

- **Tags:** Simple, hierarchical concepts (e.g., `#project`, `#ai`).
- **Properties:** Key-value pairs with defined types and operators (e.g., `[status:is:Active]`, `[price < 200]`).

### 2. The Ontology
The Ontology is the backbone of Notention's semantic system. It's a user-defined schema that acts as the "language" for your structured data. It defines all available tags and property keys, along with their data types (string, number, date, geo, etc.) and, crucially, the **operators** they can use.

### 3. Real vs. Imaginary (The Core Idea)
This is what makes Notention unique. Every piece of structured data can be defined as either "real" or "imaginary."

-   **Real Data** represents a definite, observed fact. It typically uses the `is` operator.
    -   `[client:is:Acme Corp]` - The client *is* Acme Corp.
    -   `[meetingDate:is:2024-09-15]` - The meeting date *is* set.
    -   `[temperature:is:25]` - It *is* 25 degrees.

-   **Imaginary Data** represents a condition, a query, a desire, or a potential state. It uses conditional operators like `greater than`, `less than`, `contains`, `is not`, `between`, etc.
    -   `[budget < 5000]` - I'm looking for a solution with a budget *less than* $5000.
    -   `[skill:contains:React]` - The ideal candidate has a skill that *contains* React.
    -   `[deadline > 2025-01-01]` - The required deadline *is after* the start of 2025.

**Why does this matter?** When you publish a note to a decentralized network like Nostr, this distinction powers a semantic matching system.
- A note with `[service:is:Web Design]` can be matched with a note containing `[looking for:is:Web Design]`.
- A note from a freelancer with `[hourlyRate < 100]` can be automatically discovered by someone whose project note contains `[budget:is:<100/hr]`.

### 4. Decentralization via Nostr
Notention is a local-first application, meaning all your data is stored securely in your browser. However, you can choose to publish notes to the decentralized Nostr network. When published, the embedded semantic data allows your notes to become part of a global, queryable information network, without a central server.

---

## Architecture Overview

Notention is a client-side Progressive Web App (PWA) built with modern web technologies.

-   **Framework:** React with TypeScript for a robust and type-safe codebase.
-   **Styling:** TailwindCSS for rapid, utility-first UI development.
-   **Editor:** A custom `contentEditable`-based editor. This approach was chosen over existing libraries to allow for deep integration of custom, interactive semantic widgets directly within the text flow.
-   **Local Storage:** `localforage` is used to provide a simple, asynchronous API over IndexedDB, ensuring a reliable local-first experience.
-   **AI Integration:** The Google Gemini API is used for optional, privacy-respecting AI features like note summarization. The API key is managed by the user.
-   **Decentralization:** `nostr-tools` provides the low-level primitives for interacting with the Nostr network, enabling decentralized identity and note publishing.

---

## Key Features

-   **Rich-Text Editor:** A clean, intuitive editor that supports standard formatting.
-   **Inline Semantic Widgets:** Fluidly insert tags (`#tag`) and properties (`[key:op:value]`) as you type.
-   **Ontology-Driven Data Entry:** The editor's popovers are powered by your ontology, providing type-aware inputs (date pickers, number fields, dropdowns for enums).
-   **Real vs. Imaginary Editing:** The property editor allows you to seamlessly switch between factual and conditional operators.
-   **Local-First & Offline:** All data lives on your device first, making the app fast, private, and available offline.
-   **Optional Nostr Publishing:** Share your notes on a censorship-resistant, decentralized social network.
-   **AI Summarization:** Generate concise summaries of long notes with the click of a button.