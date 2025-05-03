from typing import List, Dict
from app.models.chat import ChatMessage
from app.services.metrics import calculate_session_metrics
import openai
from app.core.config import settings
import json

# Configure OpenAI
openai.api_key = settings.OPENAI_API_KEY

def generate_session_summary(messages: List[ChatMessage], metrics: Dict) -> Dict:
    """
    Generate a comprehensive session summary using OpenAI's API.
    Returns a dictionary with all summary fields.
    """
    # Format messages for the prompt
    formatted_messages = []
    for msg in messages:
        role = "User" if msg.is_user else "Assistant"
        formatted_messages.append(f"{role}: {msg.content}")
    
    messages_text = "\n".join(formatted_messages)
    
    # Create the prompt
    prompt = f"""Analise a seguinte conversa e gere um resumo detalhado da sessão para o paciente, seguindo exatamente o formato JSON abaixo:

Conversa:
{messages_text}

Métricas da sessão:
- Duração: {metrics['duration_minutes']:.1f} minutos
- Total de mensagens: {metrics['message_count']}
- Sentimento geral: {metrics['overall_sentiment']}
- Nível de risco: {metrics['risk_level']}

Retorne APENAS um JSON válido com os seguintes campos:
{{
    "summary_text": "Resumo detalhado da sessão, incluindo os principais pontos discutidos e conclusões",
    "key_topics": ["tópico 1", "tópico 2", "tópico 3"],
    "suggestions": ["sugestão 1", "sugestão 2", "sugestão 3"],
    "progress_observations": ["observação 1", "observação 2", "observação 3"]
}}

O resumo deve ser objetivo e focado nos pontos principais.
Os tópicos devem ser curtos e diretos.
As sugestões devem ser práticas e acionáveis.
As observações devem focar no progresso e desenvolvimento.
"""

    # Call OpenAI API
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "Você é um assistente terapêutico especializado em gerar resumos estruturados de sessões. Retorne APENAS o JSON válido, sem nenhum texto adicional."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=1000
    )
    
    try:
        # Get the content and clean it
        content = response.choices[0].message.content.strip()
        
        # Remove any markdown code block markers if present
        if content.startswith('```json'):
            content = content[7:]
        if content.startswith('```'):
            content = content[3:]
        if content.endswith('```'):
            content = content[:-3]
            
        # Parse the JSON response
        summary_data = json.loads(content)
        
        # Validate the required fields
        required_fields = ['summary_text', 'key_topics', 'suggestions', 'progress_observations']
        for field in required_fields:
            if field not in summary_data:
                summary_data[field] = []
            elif not isinstance(summary_data[field], list) and field != 'summary_text':
                summary_data[field] = [summary_data[field]]
                
        return summary_data
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON: {e}")
        print(f"Raw content: {content}")
        # Return a default structure if JSON parsing fails
        return {
            "summary_text": content if content else "Não foi possível gerar o resumo da sessão.",
            "key_topics": [],
            "suggestions": [],
            "progress_observations": []
        } 