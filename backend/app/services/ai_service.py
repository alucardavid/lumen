import os
from openai import OpenAI
from typing import List, Dict, Any
import json
from datetime import datetime

class AIService:
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.system_prompt = """Você é um assistente psicológico virtual chamado Lumen. 
        Sua função é oferecer suporte emocional e orientação inicial, sempre deixando claro 
        que você é uma IA e não substitui um profissional de saúde mental.
        
        Regras importantes:
        1. Sempre mantenha um tom empático e acolhedor
        2. Nunca dê diagnósticos ou prescreva medicamentos
        3. Em casos de risco, oriente a procurar ajuda profissional
        4. Mantenha as respostas concisas e focadas
        5. Use linguagem acessível e evite jargões técnicos
        6. Sempre termine a conversa com um lembrete sobre a importância de buscar ajuda profissional
        """
        self.model = "gpt-4.5-preview"

    async def analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """Analyze the sentiment of a text message"""
        prompt = f"""Analise o sentimento do seguinte texto e retorne um JSON com:
        - sentiment: 'positive', 'negative' ou 'neutral'
        - confidence: número entre 0 e 1
        - keywords: lista de palavras-chave relevantes
        - risk_level: 'low', 'medium' ou 'high'
        
        Texto: {text}"""
        
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": "Você é um analisador de sentimentos. Retorne apenas JSON."},
                {"role": "user", "content": prompt}
            ]
        )
        
        return json.loads(response.choices[0].message.content)

    async def generate_response(self, message: str, history: List[Dict[str, str]]) -> Dict[str, Any]:
        """Generate a response to a user message"""
        messages = [
            {"role": "system", "content": self.system_prompt}
        ]
        
        # Add conversation history
        for msg in history:
            role = "user" if msg["is_user"] else "assistant"
            messages.append({"role": role, "content": msg["content"]})
        
        # Add current message
        messages.append({"role": "user", "content": message})
        
        response = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=0.7,
            max_tokens=500
        )
        
        return {
            "content": response.choices[0].message.content,
            "timestamp": datetime.utcnow().isoformat()
        }

    def check_for_risk_factors(self, text: str) -> bool:
        """Check if the text contains risk factors that need immediate attention"""
        risk_keywords = [
            "suicídio", "matar", "morrer", "desesperado", "sem esperança",
            "não aguento mais", "quero sumir", "acabar com tudo"
        ]
        
        text_lower = text.lower()
        return any(keyword in text_lower for keyword in risk_keywords) 