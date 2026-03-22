"""
Streamlit Frontend for RAG Chatbot
Run: streamlit run streamlit_app.py
"""

import requests
import streamlit as st
import json

# Configuration
API_BASE_URL = st.sidebar.text_input("API URL", "http://localhost:8000")

st.set_page_config(
    page_title="RAG Chatbot Tester",
    page_icon="🤖",
    layout="wide",
)

st.title("🤖 RAG Chatbot Tester")

# Sidebar for document management
st.sidebar.header("📄 Document Management")

# File upload section
st.sidebar.subheader("Upload Document")
uploaded_file = st.sidebar.file_uploader(
    "Choose a text file",
    type=["txt", "md", "json"],
    help="Upload a document to ingest into the RAG system",
)

source_name = st.sidebar.text_input("Source Name", "uploaded_doc")

if st.sidebar.button("📤 Ingest Document", disabled=uploaded_file is None):
    if uploaded_file:
        content = uploaded_file.read().decode("utf-8")

        with st.sidebar.status("Ingesting document..."):
            try:
                response = requests.post(
                    f"{API_BASE_URL}/documents/ingest",
                    json={
                        "content": content,
                        "source": source_name,
                        "document_id": uploaded_file.name.replace(".", "_"),
                    },
                    timeout=60,
                )

                if response.status_code == 200:
                    result = response.json()
                    st.sidebar.success(
                        f"✅ Ingested! ID: {result['document_id']}, "
                        f"Chunks: {result['chunks_created']}"
                    )
                else:
                    st.sidebar.error(f"❌ Error: {response.text}")
            except requests.exceptions.ConnectionError:
                st.sidebar.error("❌ Cannot connect to API. Is the server running?")
            except Exception as e:
                st.sidebar.error(f"❌ Error: {e}")

# Manual text ingestion
st.sidebar.subheader("Or Paste Text")
manual_text = st.sidebar.text_area("Text content", height=150)
manual_source = st.sidebar.text_input("Source", "manual_input")

if st.sidebar.button("📤 Ingest Text", disabled=not manual_text):
    with st.sidebar.status("Ingesting text..."):
        try:
            response = requests.post(
                f"{API_BASE_URL}/documents/ingest",
                json={
                    "content": manual_text,
                    "source": manual_source,
                },
                timeout=60,
            )

            if response.status_code == 200:
                result = response.json()
                st.sidebar.success(
                    f"✅ Ingested! ID: {result['document_id']}, "
                    f"Chunks: {result['chunks_created']}"
                )
            else:
                st.sidebar.error(f"❌ Error: {response.text}")
        except requests.exceptions.ConnectionError:
            st.sidebar.error("❌ Cannot connect to API")
        except Exception as e:
            st.sidebar.error(f"❌ Error: {e}")

# List documents
st.sidebar.subheader("📋 Ingested Documents")
if st.sidebar.button("🔄 Refresh List"):
    st.rerun()

try:
    docs_response = requests.get(f"{API_BASE_URL}/documents", timeout=5)
    if docs_response.status_code == 200:
        docs = docs_response.json()
        if docs:
            for doc in docs[:10]:  # Show first 10
                st.sidebar.text(f"• {doc['document_id']} ({doc['chunk_count']} chunks)")
        else:
            st.sidebar.info("No documents ingested yet")
    else:
        st.sidebar.warning("Could not fetch documents")
except:
    st.sidebar.warning("API not available")

# Main chat interface
st.header("💬 Chat")

# Initialize chat history
if "messages" not in st.session_state:
    st.session_state.messages = []

# Display chat history
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])
        if "sources" in message and message["sources"]:
            with st.expander("📚 Sources"):
                for src in message["sources"]:
                    st.markdown(
                        f"**Score: {src['similarity_score']:.3f}** | "
                        f"Source: {src['metadata']['source']}"
                    )
                    st.text(src["content"][:300] + "..." if len(src["content"]) > 300 else src["content"])
                    st.divider()

# Chat input
if prompt := st.chat_input("Ask a question..."):
    # Add user message
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    # Get response
    with st.chat_message("assistant"):
        message_placeholder = st.empty()
        sources_placeholder = st.empty()

        try:
            # Use sync endpoint for simplicity
            response = requests.post(
                f"{API_BASE_URL}/chat/sync",
                json={"query": prompt},
                timeout=120,
            )

            if response.status_code == 200:
                result = response.json()
                answer = result["answer"]
                sources = result.get("sources", [])

                message_placeholder.markdown(answer)

                if sources:
                    with sources_placeholder.expander("📚 Sources"):
                        for src in sources:
                            st.markdown(
                                f"**Score: {src['similarity_score']:.3f}** | "
                                f"Source: {src['metadata']['source']}"
                            )
                            st.text(src["content"][:300] + "..." if len(src["content"]) > 300 else src["content"])
                            st.divider()

                # Save to history
                st.session_state.messages.append({
                    "role": "assistant",
                    "content": answer,
                    "sources": sources,
                })
            else:
                error_msg = f"❌ API Error: {response.status_code} - {response.text}"
                message_placeholder.error(error_msg)

        except requests.exceptions.ConnectionError:
            message_placeholder.error("❌ Cannot connect to API. Make sure the server is running.")
        except Exception as e:
            message_placeholder.error(f"❌ Error: {e}")

# Footer with health check
st.divider()
col1, col2, col3 = st.columns(3)

with col1:
    if st.button("🏥 Health Check"):
        try:
            health = requests.get(f"{API_BASE_URL}/health", timeout=5)
            if health.status_code == 200:
                st.success(f"✅ API Healthy: {health.json()}")
            else:
                st.error("❌ API unhealthy")
        except:
            st.error("❌ Cannot reach API")

with col2:
    if st.button("🗑️ Clear Chat"):
        st.session_state.messages = []
        st.rerun()

with col3:
    st.markdown(f"API: `{API_BASE_URL}`")
