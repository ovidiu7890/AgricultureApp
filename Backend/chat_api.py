"""
Flask API for RAG Chat
Exposes the multimodal PDF chat as a REST endpoint
"""
import os
import sys
from flask import Blueprint, request, jsonify
from flask_cors import cross_origin

# Add chat directory to path for imports
chat_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'chat')
sys.path.insert(0, chat_dir)

from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables from chat/.env
load_dotenv(os.path.join(chat_dir, '.env'))

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


@chat_bp.route('/chat', methods=['POST'])
@cross_origin()
def chat():
    """
    Handle chat requests
    
    Request body:
    {
        "question": "What crops grow well in spring?"
    }
    
    Response:
    {
        "answer": "...",
        "citations": ["page_1", "table_2"],
        "error": null
    }
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
    
    # Get question from request
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
    
    try:
        # Import RAG functions
        from rag_chat import retrieve, ask
        from config import TOP_K
        
        # Retrieve relevant documents
        hits = retrieve(
            _rag_state['client'],
            _rag_state['index'],
            _rag_state['records'],
            question,
            TOP_K
        )
        
        # Generate answer
        result = ask(_rag_state['client'], question, hits)
        
        return jsonify({
            'answer': result['answer'],
            'citations': result.get('citations', []),
            'error': None
        })
        
    except Exception as e:
        print(f"Chat error: {e}")
        return jsonify({
            'answer': None,
            'citations': [],
            'error': str(e)
        }), 500


@chat_bp.route('/chat/health', methods=['GET'])
@cross_origin()
def chat_health():
    """Health check for the chat API"""
    if not _rag_state['initialized']:
        initialize_rag()
    
    return jsonify({
        'status': 'healthy' if _rag_state['error'] is None else 'degraded',
        'rag_initialized': _rag_state['initialized'],
        'error': _rag_state['error']
    })
