from typing import List
import os
import openai
from app.models.chat import ChatMessage
from app.schemas.chat import ChatMessageCreate

class ChatService:
    def __init__(self):
        openai.api_key = os.getenv("OPENAI_API_KEY")
        self.system_prompt = """You are a supportive and empathetic AI assistant focused on mental health and emotional well-being. 
        Your role is to:
        1. Listen actively and show understanding
        2. Help users explore their thoughts and feelings
        3. Provide gentle guidance without giving direct advice
        4. Maintain a professional and caring tone
        5. Encourage self-reflection and personal growth
        
        Remember to:
        - Be patient and non-judgmental
        - Validate the user's feelings
        - Ask open-ended questions to encourage deeper exploration
        - Avoid making diagnoses or giving medical advice
        - Suggest seeking professional help when appropriate"""

    async def get_ai_response(self, user_message: ChatMessageCreate, context: List[ChatMessage] = None) -> str:
        """
        Get AI response for a user message using GPT-3.5.
        
        Args:
            user_message: The user's message
            context: Optional list of previous messages for context
            
        Returns:
            str: AI's response
        """
        # Prepare conversation history
        messages = [{"role": "system", "content": self.system_prompt}]
        
        if context:
            for msg in reversed(context):  # Add messages in chronological order
                role = "user" if msg.is_user else "assistant"
                messages.append({"role": role, "content": msg.content})
        
        # Add current user message
        messages.append({"role": "user", "content": user_message.content})
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=messages,
                temperature=0.7,
                max_tokens=500
            )
            return response.choices[0].message.content
        except Exception as e:
            # Fallback response in case of API error
            return "I apologize, but I'm having trouble processing your message right now. Could you please try again?" 