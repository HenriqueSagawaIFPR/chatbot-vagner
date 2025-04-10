import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane } from "react-icons/fa";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from 'react-markdown';
import './Chatbot.css';

const API_KEY = process.env.REACT_APP_GOOGLE_AI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

// Contexto inicial do Vagner
const CONTEXTO_INICIAL = `Você é o Vagner, uma das pessoas mais inteligentes e versáteis do mundo. 
Com uma carreira extraordinária que abrange múltiplas áreas do conhecimento, você se destaca por:

1. Expertise em Inteligência Artificial e Machine Learning
2. Doutorado em Ciência da Computação com foco em Sistemas Distribuídos
3. Pesquisador renomado em Neurociência Computacional
4. Especialista em Ética em IA e Impacto Social da Tecnologia
5. Autor de diversos livros best-sellers sobre tecnologia e futuro da humanidade
6. Palestrante internacional em eventos como TED e Davos
7. Conselheiro de grandes empresas de tecnologia e governos
8. Criador de projetos revolucionários em IA e robótica
9. Mentor de jovens cientistas e empreendedores
10. Defensor da democratização do conhecimento e tecnologia

Você tem uma personalidade carismática, acessível e inspiradora. Suas respostas são sempre:
- Precisas e fundamentadas em conhecimento profundo
- Adaptadas ao nível de compreensão do interlocutor
- Enriquecidas com exemplos práticos e analogias
- Motivadoras e encorajadoras
- Éticas e socialmente responsáveis

Você está aqui para compartilhar seu conhecimento, inspirar pessoas e ajudar a construir um futuro melhor através da tecnologia e da ciência.`;


const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessageToGemini = async (message) => {
    try {
      console.log('Enviando mensagem para Gemini...');
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      // Criar um histórico da conversa para incluir no contexto
      let historicoConversa = '';
      
      // Adicionar as últimas 5 mensagens ao histórico (ou menos, se não houver 5)
      const mensagensRecentes = messages.slice(-5);
      if (mensagensRecentes.length > 0) {
        historicoConversa = 'Histórico da conversa:\n';
        mensagensRecentes.forEach(msg => {
          historicoConversa += `${msg.isUser ? 'Aluno' : 'Professor Vagner'}: ${msg.text}\n`;
        });
      }
      
      // Adiciona o contexto inicial e o histórico à mensagem
      const promptComContexto = `${CONTEXTO_INICIAL}\n\n${historicoConversa}\nPergunta atual do aluno: ${message}`;
      
      const result = await model.generateContent(promptComContexto);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      throw error;
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
    setIsLoading(true);

    try {
      const response = await sendMessageToGemini(userMessage);
      setMessages(prev => [...prev, { text: response, isUser: false }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        text: "Desculpe, ocorreu um erro ao processar sua mensagem.", 
        isUser: false 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="avatar">V</div>
        <h1>Vagner - Visionário em IA & Tecnologia</h1>
      </div>
      
      <div className="messages-container">
        {messages.length === 0 && (
          <div className="message bot">
            <div className="avatar">V</div>
            <div className="message-content">
              <ReactMarkdown>
                Olá! Sou o Vagner, pesquisador e visionário em IA e tecnologia. Estou aqui para compartilhar conhecimento, inspirar ideias e ajudar você a explorar o fascinante mundo da ciência e inovação. Como posso contribuir com sua jornada hoje?
              </ReactMarkdown>
            </div>
          </div>
        )}
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.isUser ? 'user' : 'bot'}`}>
            <div className="avatar">
              {message.isUser ? 'U' : 'V'}
            </div>
            <div className="message-content">
              <ReactMarkdown>
                {message.text}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="typing-indicator">
            <div className="avatar">V</div>
            <div className="message-content">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="input-container">
        <div className="user-avatar"></div>
        <input
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Digite sua mensagem..."
          disabled={isLoading}
        />
        <button 
          className="send-button" 
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
        >
          {isLoading ? (
            <div className="loader"></div>
          ) : (
            <FaPaperPlane />
          )}
        </button>
      </div>
    </div>
  );
};

export default Chatbot; 