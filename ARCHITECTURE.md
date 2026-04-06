# SmartReceipt Analyzer: Architecture & Data Flow

## 📋 Project Summary
**SmartReceipt Analyzer** is an AI-powered SaaS application built to automate expense tracking. It provides a premium Next.js dashboard for finance teams, while the heavy lifting of document processing is split between two distinct backends:
1. **n8n Automated Workflow**: Handles the asynchronous image processing, OCR, storage, and notifications through a strict 10-step agent pipeline.
2. **Python API Backend**: Manages the core database, authentication, the AI conversational assistant using your OpenAI API key, and all remaining application logic.

---

## 🔁 Excalidraw / Mermaid Data Flow

You can copy and paste the raw code block below directly into **Mermaid Live**, or into Excalidraw using its "Mermaid to Excalidraw" import tool to instantly generate the visual architecture.

```mermaid
flowchart TD
    %% Define Styles
    classDef frontend fill:#111827,stroke:#FACC15,stroke-width:2px,color:#fff
    classDef n8n fill:#F43F5E,stroke:#fff,stroke-width:2px,color:#fff
    classDef python fill:#3B82F6,stroke:#fff,stroke-width:2px,color:#fff
    classDef database fill:#10B981,stroke:#fff,stroke-width:2px,color:#fff

    %% Components
    UI[Next.js Dashboard UI\nUpload / Chat / Insights]:::frontend
    DB[(MongoDB Database)]:::database
    GSheet[(Google Sheets / Google Drive\nBackup & Sync)]:::database

    subgraph PYTHON["Python FastAPI Backend (Core Logic)"]
        API[Main API Router]
        Auth[Authentication Logic]
        Chat[Conversational AI (OpenAI API)]
        Insights[Data Aggregation]
    end
    PYTHON:::python

    subgraph N8N["n8n Agent Pipeline (Document Processing)"]
        direction TB
        A1(1. Trigger Agent\nOn form submission)
        A2(2. Processing Agent\nSplit + Loop)
        A5(3. OCR Agent\nAnalyze Receipt)
        A6(4. Extraction Agent\nExtract Data)
        A7(5. Routing Agent\nSwitch logic)
        A8(6. Categorization Agent\nGoogle Sheets)
        A4(7. Storage Agent\nGoogle Drive)
        A9(8. Merge Agent\nMerge formats)
        A3(9. Notification Agent\nSlack messages)
        A10(10. Error Handling Agent\nMsg Error)
    end
    N8N:::n8n

    %% Data Flow Connections
    UI -- "1. Upload Request" --> API
    API -- "2. Webhook triggers n8n" --> A1
    
    %% n8n Internal Flow
    A1 --> A2
    A2 --> A5
    A5 -. "Raw Text" .-> A6
    A6 -. "JSON" .-> A7
    A7 --> A8
    A7 --> A4
    A8 & A4 --> A9
    A9 --> A3
    A2 -- "Failure" --> A10
    
    A8 -. "Sync row" .-> GSheet
    A4 -. "Save file" .-> GSheet

    %% Return back to Python / DB
    A9 -- "3. Return structured data" --> API
    API -- "4. Save" --> DB
    
    %% UI interactions
    UI -- "Ask question" --> Chat
    Chat -- "Query via OpenAI" --> DB
    UI -- "Load Insights" --> Insights
    Insights -- "Fetch records" --> DB
```

## 📝 Detailed Agent Roles in n8n

1. **Trigger Agent**: Listens for the webhook payload when a user submits a form.
2. **Processing Agent**: Logic node that splits multiple receipts from a single upload and loops through them.
3. **OCR Agent**: Visually analyzes the image and extracts the raw text layer.
4. **Extraction Agent**: Parses the raw text into structured JSON fields (merchant, amount, date).
5. **Routing Agent**: A switch node that routes the receipt based on category or value.
6. **Categorization Agent**: Connects to Google Sheets to append a new categorized row.
7. **Storage Agent**: Uploads the raw receipt image to Google Drive.
8. **Merge Agent**: Re-combines branches and formats the final verified JSON output.
9. **Notification Agent**: Hits a Slack webhook channel to alert the team.
10. **Error Handling Agent**: A catch node that intercepts failed branches to send error messages without breaking the pipeline.
