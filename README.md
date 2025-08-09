# Notention - A Decentralized Semantic Notebook

Notention is not just another note-taking app. It's a tool for thought designed to build a personal, decentralized
knowledge graph. It empowers users to capture, organize, and connect information using a rich semantic structure,
seamlessly blending human-readable prose with machine-readable data.

At its core, Notention is built on a powerful idea: the distinction between **real** (observed facts) and **imaginary
** (conditional or desired states). This allows you to create notes that are not just static records, but dynamic
documents that can be queried, matched, and discovered on a decentralized network.

---

## Core Concepts

### 1. Semantic Notes

Every note in Notention is a document that can contain both unstructured text and structured data. This structured data
is embedded directly within the note as inline "widgets," which are both easy to read and parseable by machines.

- **Tags:** Simple, hierarchical concepts (e.g., `#project`, `#ai`).
- **Properties:** Key-value pairs with defined types and operators (e.g., `[status:is:Active]`, `[price < 200]`).

### 2. The Ontology

The Ontology is the backbone of Notention's semantic system. It's a user-defined schema that acts as the "language" for
your structured data. It defines all available tags and property keys, along with their data types (string, number,
date, geo, etc.) and, crucially, the **operators** they can use.

### 3. Real vs. Imaginary (The Core Idea)

This is what makes Notention unique. Every piece of structured data can be defined as either "real" or "imaginary."

- **Real Data** represents a definite, observed fact. It typically uses the `is` operator.
    - `[client:is:Acme Corp]` - The client _is_ Acme Corp.
    - `[meetingDate:is:2024-09-15]` - The meeting date _is_ set.
    - `[temperature:is:25]` - It _is_ 25 degrees.

- **Imaginary Data** represents a condition, a query, a desire, or a potential state. It uses conditional operators like
  `greater than`, `less than`, `contains`, `is not`, `between`, etc.
    - `[budget < 5000]` - I'm looking for a solution with a budget _less than_ $5000.
    - `[skill:contains:React]` - The ideal candidate has a skill that _contains_ React.
    - `[deadline > 2025-01-01]` - The required deadline _is after_ the start of 2025.

**Why does this matter?** This distinction is the engine behind Notention's **Networked Discovery** feature. When you
publish a note containing "real" data, it becomes a public, discoverable fact on the Nostr network. When you create a
local note with "imaginary" data, it acts as a query.

The Discovery view allows you to select one of your "imaginary" notes and find "real" notes from other users across the
network that satisfy your conditions.

- Your note with `[looking-for:is:Web Design]` will find a freelancer's note containing `[service:is:Web Design]`.
- Your project note with `[budget < 5000]` will find contractor notes with `[rate:is:4000]`.

### 4. Decentralization via Nostr

Notention is a local-first application, meaning all your data is stored securely in your browser. However, you can
choose to publish notes to the decentralized Nostr network. When published, the embedded semantic data allows your notes
to become part of a global, queryable information network, without a central server.

---

## Architecture Overview

Notention is a client-side Progressive Web App (PWA) built with modern web technologies.

- **Framework:** React with TypeScript for a robust and type-safe codebase.
- **Styling:** TailwindCSS for rapid, utility-first UI development.
- **Editor:** A custom `contentEditable`-based editor. This approach was chosen over existing libraries to allow for
  deep integration of custom, interactive semantic widgets directly within the text flow.
- **Local Storage:** `localforage` is used to provide a simple, asynchronous API over IndexedDB, ensuring a reliable
  local-first experience.
- **AI Integration:** The Google Gemini API is used for optional, privacy-respecting AI features like note
  summarization. The API key is managed by the user.
- **Decentralization:** `nostr-tools` provides the low-level primitives for interacting with the Nostr network, enabling
  decentralized identity and note publishing.

---

## Key Features

- **Rich-Text Editor:** A clean, intuitive editor that supports standard formatting.
- **Inline Semantic Widgets:** Fluidly insert tags (`#tag`) and properties (`[key:op:value]`) as you type.
- **Ontology-Driven Data Entry:** The editor's popovers are powered by your ontology, providing type-aware inputs (date
  pickers, number fields, dropdowns for enums).
- **Real vs. Imaginary Editing:** The property editor allows you to seamlessly switch between factual and conditional
  operators.
- **Local-First & Offline:** All data lives on your device first, making the app fast, private, and available offline.
- **Optional Nostr Publishing:** Share your notes on a censorship-resistant, decentralized social network.
- **Networked Semantic Discovery:** Select one of your notes containing a query (e.g., `[looking-for:is:service]`) and
  discover notes from other users across the network that match your criteria.
- **AI Summarization:** Generate concise summaries of long notes with the click of a button.
