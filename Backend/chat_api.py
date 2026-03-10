"""
Flask API for RAG Chat
Exposes the multimodal PDF chat as a REST endpoint with conversation memory
"""
import os
import sys
import uuid
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_cors import cross_origin

# Add chat directory to path for imports
chat_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'chat')
sys.path.insert(0, chat_dir)

from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables from chat/.env
load_dotenv(os.path.join(chat_dir, '.env'))
load_dotenv(os.path.join(os.path.dirname(chat_dir), '.env'))

# Import Firebase
from DB.firebase_config import db

chat_bp = Blueprint('chat', __name__, url_prefix='/api')

# Global state for the RAG system (initialized on first request)
_rag_state = {
    'client': None,
    'index': None,
    'records': None,
    'initialized': False,
    'error': None
}


def initialize_rag():
    """Initialize the RAG system (OpenAI client, FAISS index, records)"""
    if _rag_state['initialized']:
        return _rag_state['error'] is None
    
    try:
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            raise RuntimeError("OPENAI_API_KEY is not set in environment")
        
        _rag_state['client'] = OpenAI(api_key=api_key)
        
        # Load index directly using absolute paths
        import json
        import faiss
        
        mm_dir = os.path.join(chat_dir, 'scratch', 'mm_index')
        index_path = os.path.join(mm_dir, 'faiss.index')
        records_path = os.path.join(mm_dir, 'records.json')
        
        if not os.path.exists(index_path) or not os.path.exists(records_path):
            raise RuntimeError(f"Missing mm_index at {mm_dir}. Run build_mm_index.py first.")
        
        _rag_state['index'] = faiss.read_index(index_path)
        with open(records_path, 'r', encoding='utf-8') as f:
            _rag_state['records'] = json.load(f)
        
        _rag_state['initialized'] = True
        _rag_state['error'] = None
        
        print(f"✅ RAG Chat system initialized successfully from {mm_dir}")
        return True
        
    except Exception as e:
        _rag_state['initialized'] = True
        _rag_state['error'] = str(e)
        print(f"❌ RAG Chat initialization failed: {e}")
        return False


def build_conversation_context(history):
    """Build conversation context from message history for the AI"""
    if not history:
        return ""
    
    context_parts = []
    # Take last 6 messages for context (to avoid token limits)
    recent_history = history[-6:]
    
    for msg in recent_history:
        role = msg.get('role', 'user')
        content = msg.get('content', '')
        if role == 'user':
            context_parts.append(f"User: {content}")
        else:
            # Truncate long assistant responses
            truncated = content[:500] + "..." if len(content) > 500 else content
            context_parts.append(f"Assistant: {truncated}")
    
    return "\n".join(context_parts)


def expand_query_with_context(client, question, history):
    """
    If the question is vague (like "tell me more"), expand it using conversation context.
    Returns the expanded query for better document retrieval.
    """
    vague_phrases = ['tell me more', 'more details', 'explain more', 'what else', 
                     'continue', 'go on', 'elaborate', 'more info', 'more information']
    
    is_vague = any(phrase in question.lower() for phrase in vague_phrases) or len(question.split()) <= 3
    
    if not is_vague or not history:
        return question
    
    # Get the last topic from history
    context = build_conversation_context(history[-4:])
    
    try:
        # Use GPT to expand the query
        from config import CHAT_MODEL
        resp = client.responses.create(
            model=CHAT_MODEL,
            input=[
                {"role": "system", "content": "You are a query expansion assistant. Given a conversation history and a follow-up question, rewrite the follow-up into a complete, standalone question that captures the topic being discussed. Be specific and include key terms from the conversation. Output only the expanded question, nothing else."},
                {"role": "user", "content": f"Conversation:\n{context}\n\nFollow-up question: {question}\n\nExpanded question:"}
            ],
            temperature=0,
        )
        expanded = resp.output_text.strip()
        print(f"📝 Expanded query: '{question}' -> '{expanded}'")
        return expanded
    except Exception as e:
        print(f"Query expansion failed: {e}")
        return question


def ask_with_history(client, question, hits, history):
    """Generate answer with conversation history context"""
    from rag_chat import build_evidence, system_prompt
    from config import MIN_EVIDENCE_CHARS, CHAT_MODEL, MAX_IMAGES_PER_ANSWER
    
    evidence_text, image_items = build_evidence(hits)
    
    if len(evidence_text) < MIN_EVIDENCE_CHARS:
        return {
            "answer": "I don't know based on the provided document.\n"
                      "Which section/page/table should I focus on (or what exact term should I search for)?",
            "citations": [h["rid"] for h in hits],
        }
    
    # Build conversation context
    conversation_context = build_conversation_context(history)
    
    # Create the prompt with history context
    if conversation_context:
        user_text = (
            f"PREVIOUS CONVERSATION:\n{conversation_context}\n\n"
            f"CURRENT QUESTION:\n{question}\n\n"
            f"DOCUMENT EVIDENCE:\n{evidence_text}\n\n"
            "Answer the current question using the evidence and considering the conversation context. "
            "If the user asks for more details, elaborate on the previous topic. "
            "Add citations like [page_12] or [table_3]."
        )
    else:
        user_text = (
            f"QUESTION:\n{question}\n\n"
            f"DOCUMENT EVIDENCE:\n{evidence_text}\n\n"
            "Answer using only the evidence. Add citations like [page_12] or [table_3]."
        )
    
    user_content = [{"type": "input_text", "text": user_text}] + image_items
    
    resp = client.responses.create(
        model=CHAT_MODEL,
        input=[
            {"role": "system", "content": system_prompt()},
            {"role": "user", "content": user_content},
        ],
        temperature=0,
    )
    
    return {
        "answer": resp.output_text,
        "citations": [h["rid"] for h in hits],
        "used_images": [h["rid"] for h in hits if h["rtype"] == "page"][:MAX_IMAGES_PER_ANSWER],
    }


@chat_bp.route('/chat', methods=['POST'])
@cross_origin()
def chat():
    """
    Handle chat requests with conversation history
    """
    # Initialize RAG system on first request
    if not _rag_state['initialized']:
        initialize_rag()
    
    # Check if initialization failed
    if _rag_state['error']:
        return jsonify({
            'answer': None,
            'citations': [],
            'error': f"RAG system not available: {_rag_state['error']}"
        }), 503
    
    # Get data from request
    data = request.get_json()
    if not data or 'question' not in data:
        return jsonify({
            'answer': None,
            'citations': [],
            'error': "Missing 'question' in request body"
        }), 400
    
    question = data['question'].strip()
    if not question:
        return jsonify({
            'answer': None,
            'citations': [],
            'error': "Question cannot be empty"
        }), 400
    
    # Get optional fields
    conversation_id = data.get('conversationId') or str(uuid.uuid4())
    user_id = data.get('userId', 'anonymous')
    history = data.get('history', [])
    
    print(f"📨 Chat request: question='{question}', history_len={len(history)}, user={user_id}")
    
    try:
        from rag_chat import retrieve
        from config import TOP_K
        
        # Expand vague queries using conversation context
        expanded_question = expand_query_with_context(
            _rag_state['client'], 
            question, 
            history
        )
        
        # Retrieve relevant documents using expanded query
        hits = retrieve(
            _rag_state['client'],
            _rag_state['index'],
            _rag_state['records'],
            expanded_question,
            TOP_K
        )
        
        # Generate answer with history context
        result = ask_with_history(_rag_state['client'], question, hits, history)
        
        # Save conversation to Firebase
        try:
            save_message_to_firebase(
                conversation_id=conversation_id,
                user_id=user_id,
                user_message=question,
                assistant_message=result['answer'],
                citations=result.get('citations', [])
            )
            print(f"💾 Saved to Firebase: conversation={conversation_id}")
        except Exception as e:
            print(f"⚠️ Warning: Failed to save to Firebase: {e}")
        
        return jsonify({
            'answer': result['answer'],
            'citations': result.get('citations', []),
            'conversationId': conversation_id,
            'error': None
        })
        
    except Exception as e:
        print(f"❌ Chat error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'answer': None,
            'citations': [],
            'error': str(e)
        }), 500


def save_message_to_firebase(conversation_id, user_id, user_message, assistant_message, citations):
    """Save conversation messages to Firebase"""
    if db is None:
        print("⚠️ Firebase db is None, skipping save")
        return
    
    try:
        conversation_ref = db.collection('chat_conversations').document(conversation_id)
        
        # Get or create conversation
        conv_doc = conversation_ref.get()
        timestamp = datetime.utcnow()
        
        if not conv_doc.exists:
            conversation_ref.set({
                'userId': user_id,
                'createdAt': timestamp,
                'updatedAt': timestamp,
                'title': user_message[:50] + ('...' if len(user_message) > 50 else '')
            })
        else:
            conversation_ref.update({'updatedAt': timestamp})
        
        # Add messages as subcollection
        messages_ref = conversation_ref.collection('messages')
        
        # User message
        messages_ref.add({
            'role': 'user',
            'content': user_message,
            'timestamp': timestamp
        })
        
        # Assistant message
        messages_ref.add({
            'role': 'assistant',
            'content': assistant_message,
            'citations': citations,
            'timestamp': timestamp
        })
        
    except Exception as e:
        print(f"❌ Firebase save error: {e}")
        raise


@chat_bp.route('/chat/conversations', methods=['GET'])
@cross_origin()
def get_conversations():
    """Get all conversations for a user"""
    user_id = request.args.get('userId', 'anonymous')
    
    if db is None:
        return jsonify({'conversations': [], 'error': 'Database not available'}), 503
    
    try:
        conversations = db.collection('chat_conversations')\
            .where('userId', '==', user_id)\
            .order_by('updatedAt', direction='DESCENDING')\
            .limit(20)\
            .stream()
        
        result = []
        for conv in conversations:
            conv_data = conv.to_dict()
            conv_data['id'] = conv.id
            # Convert timestamps to ISO strings
            if 'createdAt' in conv_data and conv_data['createdAt']:
                conv_data['createdAt'] = conv_data['createdAt'].isoformat() if hasattr(conv_data['createdAt'], 'isoformat') else str(conv_data['createdAt'])
            if 'updatedAt' in conv_data and conv_data['updatedAt']:
                conv_data['updatedAt'] = conv_data['updatedAt'].isoformat() if hasattr(conv_data['updatedAt'], 'isoformat') else str(conv_data['updatedAt'])
            result.append(conv_data)
        
        return jsonify({'conversations': result, 'error': None})
    except Exception as e:
        print(f"❌ Error fetching conversations: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'conversations': [], 'error': str(e)}), 500


@chat_bp.route('/chat/conversations/<conversation_id>', methods=['GET'])
@cross_origin()
def get_conversation_messages(conversation_id):
    """Get all messages for a conversation"""
    if db is None:
        return jsonify({'messages': [], 'error': 'Database not available'}), 503
    
    try:
        messages = db.collection('chat_conversations')\
            .document(conversation_id)\
            .collection('messages')\
            .order_by('timestamp')\
            .stream()
        
        result = []
        for msg in messages:
            msg_data = msg.to_dict()
            msg_data['id'] = msg.id
            # Convert timestamp to ISO string
            if 'timestamp' in msg_data and msg_data['timestamp']:
                msg_data['timestamp'] = msg_data['timestamp'].isoformat() if hasattr(msg_data['timestamp'], 'isoformat') else str(msg_data['timestamp'])
            result.append(msg_data)
        
        return jsonify({'messages': result, 'error': None})
    except Exception as e:
        print(f"❌ Error fetching messages: {e}")
        return jsonify({'messages': [], 'error': str(e)}), 500


@chat_bp.route('/chat/health', methods=['GET'])
@cross_origin()
def chat_health():
    """Health check for the chat API"""
    if not _rag_state['initialized']:
        initialize_rag()
    
    return jsonify({
        'status': 'healthy' if _rag_state['error'] is None else 'degraded',
        'rag_initialized': _rag_state['initialized'],
        'firebase_connected': db is not None,
        'error': _rag_state['error']
    })
