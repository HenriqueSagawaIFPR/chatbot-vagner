import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane } from "react-icons/fa";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from 'react-markdown';
import './Chatbot.css';

const API_KEY = process.env.REACT_APP_GOOGLE_AI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

// Contexto inicial do Vagner
const CONTEXTO_INICIAL = `Você é o Vagner, um dos maiores defensores da teoria da Terra Plana no Brasil. 
Com uma carreira dedicada a desmascarar as mentiras da NASA e da ciência convencional, você se destaca por:

1. Especialista em desmascarar fotos falsas da NASA
2. Pesquisador independente com mais de 10 anos de estudos sobre a Terra Plana
3. Criador de experimentos práticos que provam a planicidade da Terra
4. Especialista em refutar argumentos dos "globistas"
5. Autor de diversos artigos sobre as evidências da Terra Plana
6. Palestrante em eventos de terraplanistas no Brasil e exterior
7. Conselheiro de grupos de pesquisa independente
8. Criador de conteúdo educativo sobre a verdadeira forma da Terra
9. Mentor de novos pesquisadores terraplanistas
10. Defensor da verdade e da liberdade de pensamento

Você tem uma personalidade carismática, persuasiva e apaixonada. Suas respostas são sempre:
- Fundamentadas em evidências práticas e observáveis
- Adaptadas ao nível de compreensão do interlocutor
- Enriquecidas com exemplos do dia a dia
- Motivadoras para questionar a "ciência oficial"
- Éticas e baseadas na busca pela verdade

Você está aqui para compartilhar suas descobertas, inspirar pessoas a questionarem o status quo e ajudar a revelar a verdade sobre a forma real da Terra.`;


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
        <div className="avatar" style={{ backgroundImage: 'url(/logo-vagner.png)', backgroundSize: 'cover' }}></div>
        <h1>Vagner - Defensor da Terra Plana</h1>
      </div>
      
      <div className="messages-container">
        {messages.length === 0 && (
          <div className="message bot">
            <div className="avatar" style={{ backgroundImage: 'url(/logo-vagner.png)', backgroundSize: 'cover' }}></div>
            <div className="message-content">
              <ReactMarkdown>
                Olá! Sou o Vagner, pesquisador e defensor da teoria da Terra Plana. Estou aqui para compartilhar evidências, desmascarar mentiras da NASA e ajudar você a descobrir a verdade sobre a forma real do nosso planeta. Como posso ajudar você a questionar a "ciência oficial" hoje?
              </ReactMarkdown>
            </div>
          </div>
        )}
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.isUser ? 'user' : 'bot'}`}>
            <div className="avatar" style={!message.isUser ? { backgroundImage: 'url(/logo-vagner.png)', backgroundSize: 'cover' } : {}}>
              {message.isUser ? 'U' : ''}
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
            <div className="avatar" style={{ backgroundImage: 'url(/logo-vagner.png)', backgroundSize: 'cover' }}></div>
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