# Design Pattern Implementations for Project Presentation

## 1. Claudiu (Backend): Facade Pattern

**Goal:** Hide internal system complexity and provide a simplified interface for the client.

**Implementation:**
The **Facade Pattern** is implemented in the `Backend/chat_api.py` module, specifically through the `chat_bp` blueprint and the `/api/chat` endpoint.

*   **The Problem:** The AI Chat system (`rag_chat.py`) is complex. It requires initializing a connection to OpenAI, loading a persistent FAISS vector index from disk, loading a JSON mapping of records, and managing the state of these heavy resources (checking if they are already loaded `_rag_state`). Furthermore, answering a question involves a complex coordination of query expansion, vector embedding, retrieval, and LLM generation.
*   **The Solution (The Facade):** The `chat()` function serves as the **Facade**. It presents a clean, simple REST API to the frontend: just send a JSON with `{"question": "..."}` and get back `{"answer": "..."}`.
*   **How it works:** 
    *   The client (Frontend) doesn't need to know about FAISS, embeddings, or OpenAI API keys.
    *   The `initialize_rag()` function encapsulates the complex startup logic (singleton pattern for the index/client).
    *   The `chat` endpoint orchestrates the flow: validation -> initialization -> query expansion -> retrieval -> generation -> database saving.
    *   This effectively decouples the frontend from the complex details of the RAG pipeline.

## 2. Teodor (Frontend): Observer Pattern

**Goal:** The client interface must update automatically whenever changes occur in data (specifically Authentication state).

**Implementation:**
The **Observer Pattern** is implemented in `Frontend/src/context/AuthContext.jsx` using React Context and Firebase's real-time listeners.

*   **The Problem:** The entire application needs to know if a user is logged in or out to show/hide specific UI elements (like the Chat or Profile pages). Passing this state down manually through every component (prop drilling) is inefficient and error-prone.
*   **The Solution (The Observer):** We use the `AuthContext` as the "Subject" that components can observe.
*   **How it works:**
    *   We use the `onAuthStateChanged(auth, ...)` listener from Firebase. This function effectively acts as a subscription mechanism. Firebase notifies this listener whenever the authentication state changes (login/logout/token refresh).
    *   Inside the `AuthProvider`, when this listener fires, we update the local React state (`setUser`).
    *   The `AuthContext.Provider` then "notifies" all child components (the observers) that consume the context via `useAuth()`. Any component using `console.log(user)` inside a `useAuth` hook will automatically re-render with the new data whenever the user logs in or out.

## 3. Mihnea (AI Chat Bot): Adapter Pattern

**Goal:** Allow a single interface to handle the processing of multiple types of documents.

**Implementation:**
The **Adapter Pattern** is implemented in `Backend/chat/pdf_convert.py` to standardize document ingestion.

*   **The Problem:** The core RAG (Retrieval-Augmented Generation) pipeline is built to process PDFs efficiently. However, users might upload images (PNG, JPG) or Office documents, which the PDF parser cannot read natively. We need to process these incompatible interfaces so the pipeline can use them.
*   **The Solution (The Adapter):** The `convert_any_to_fixed_pdf` function acts as the **Adapter**.
*   **How it works:**
    *   It accepts a broad input interface (`input_path` of any type).
    *   It detects the file type (Adaptee).
    *   **If Image:** It uses `PIL` (Python Imaging Library) to "adapt" the image by drawing it onto a PDF canvas.
    *   **If Office Doc:** It invokes a headless `LibreOffice` subprocess to convert the document structure into a PDF.
    *   **Result:** Regardless of the input format, the function returns a `Path` to a standard PDF file. This allows the rest of the system (the "Client") to treat every file exactly the same way, simplifying the indexing logic.

## 4. Ovidiu (AI Chat Bot): Chain of Responsibility

**Goal:** Each stage of the processing pipeline acts as a handler that passes the information forward.

**Implementation:**
The **Chain of Responsibility** (or Pipeline) pattern is implemented in the core logic of `Backend/chat/rag_chat.py` and `Backend/chat_api.py`.

*   **The Problem:** Answering a user's question isn't a single step. It requires a sequence of transformations, where the output of one step is the necessary input for the next.
*   **The Solution (The Chain):** We constructed a processing pipeline where data flows through distinct handlers.
*   **How it works:**
    1.  **EXPANSION Handler (`chat_api.py`):** Receives the raw user query and conversation history. It effectively "expands" vague questions (e.g., "tell me more") into standalone queries. *Passes -> Expanded Query.*
    2.  **EMBEDDING Handler (`rag_chat.py:embed_query`):** Takes the text query and converts it into a high-dimensional vector using OpenAI's embedding model. *Passes -> Vector.*
    3.  **RETRIEVAL Handler (`rag_chat.py:retrieve`):** Uses the vector to search the FAISS index for the top-k most relevant document chunks. *Passes -> List of Hits.*
    4.  **EVIDENCE Handler (`rag_chat.py:build_evidence`):** Takes the raw hits and formats them into a structured string with citations and extracts relevant page images. *Passes -> Formatted Context.*
    5.  **GENERATION Handler (`rag_chat.py:ask`):** Takes the formatted context and the original question, constructs the final system prompt, and queries the LLM to generate the final answer.
    *   Each function acts as a link in the chain, responsible for one specific transformation before passing the data to the next stage.
