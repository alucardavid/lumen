from typing import List, Dict
from app.models.chat import ChatMessage
from app.services.metrics import calculate_session_metrics
import openai
from app.core.config import settings

# Configure OpenAI
openai.api_key = settings.OPENAI_API_KEY

def generate_session_summary(messages: List[ChatMessage], metrics: Dict) -> str:
    """
    Generate a comprehensive session summary using OpenAI's API.
    """
    # Format messages for the prompt
    formatted_messages = []
    for msg in messages:
        role = "User" if msg.is_user else "Assistant"
        formatted_messages.append(f"{role}: {msg.content}")
    
    messages_text = "\n".join(formatted_messages)
    
    # Create the prompt
    prompt = f"""Analise a seguinte conversa e gere um resumo detalhado da sessão:

Conversa:
{messages_text}

Métricas da sessão:
- Duração: {metrics['duration_minutes']:.1f} minutos
- Total de mensagens: {metrics['message_count']}
- Sentimento geral: {metrics['overall_sentiment']}
- Nível de risco: {metrics['risk_level']}

Por favor, gere um resumo que inclua:
1. Os principais tópicos discutidos
2. Pontos importantes abordados
3. Sugestões para próximas sessões
4. Observações relevantes sobre o progresso

Resumo:"""

    # Call OpenAI API
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "Você é um assistente terapêutico especializado em gerar resumos de sessões."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=500
    )
    
    return response.choices[0].message.content

def extract_key_topics(summary: str) -> List[str]:
    """
    Extract key topics from the summary using OpenAI's API.
    """
    prompt = f"""Extraia os principais tópicos deste resumo de sessão. 
    Retorne apenas uma lista de tópicos, um por linha, sem numeração ou formatação adicional.

Resumo:
{summary}

Tópicos principais:"""

    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "Você é um assistente especializado em extrair tópicos principais de textos."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3,
        max_tokens=200
    )
    
    topics = response.choices[0].message.content.strip().split('\n')
    return [topic.strip() for topic in topics if topic.strip()] 