# Lumen - Aplicativo de Apoio Psicológico com IA

Lumen é uma aplicação web que oferece suporte psicológico virtual através de um chatbot baseado em IA. O aplicativo fornece um ambiente seguro para os usuários expressarem seus sentimentos e receberem orientações iniciais, sempre mantendo a transparência de que não substitui o atendimento profissional.

## Características Principais

- Chat interativo com IA simulando um psicólogo
- Análise de sentimentos e detecção de padrões
- Histórico de sessões e feedbacks personalizados
- Alertas de risco e recomendações de ajuda profissional
- Interface responsiva e acessível
- Total conformidade com LGPD

## Tecnologias Utilizadas

### Backend
- FastAPI (Python)
- PostgreSQL
- JWT Authentication
- OpenAI API (GPT-4)

### Frontend
- React
- TypeScript
- Tailwind CSS
- Axios

## Requisitos

- Python 3.8+
- Node.js 16+
- PostgreSQL
- OpenAI API Key

## Configuração do Ambiente

1. Clone o repositório
2. Configure o ambiente virtual Python:
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
.\venv\Scripts\activate   # Windows
```

3. Instale as dependências do backend:
```bash
cd backend
pip install -r requirements.txt
```

4. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

5. Configure o banco de dados:
```bash
# Certifique-se que o PostgreSQL está rodando
# Execute o script de inicialização do banco de dados
python init_db.py
```

6. Instale as dependências do frontend:
```bash
cd frontend
npm install
```

7. Inicie o servidor de desenvolvimento:
```bash
# Backend
cd backend
uvicorn main:app --reload

# Frontend
cd frontend
npm run dev
```

## Estrutura do Projeto

```
lumen/
├── backend/           # API FastAPI
│   ├── app/
│   │   ├── api/      # Endpoints
│   │   ├── core/     # Configurações
│   │   ├── models/   # Modelos de dados
│   │   └── services/ # Lógica de negócios
│   ├── init_db.py    # Script de inicialização do banco
│   └── requirements.txt
├── frontend/         # Aplicação React
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
└── README.md
```

## Contribuição

Contribuições são bem-vindas! Por favor, leia as diretrizes de contribuição antes de enviar um pull request.

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.

## Aviso Legal

Este aplicativo não substitui o atendimento psicológico profissional. Em caso de emergência, entre em contato com o CVV (188) ou procure ajuda profissional. 