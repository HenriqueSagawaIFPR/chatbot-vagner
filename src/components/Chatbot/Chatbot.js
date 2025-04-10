import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane } from "react-icons/fa";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from 'react-markdown';
import './Chatbot.css';

const API_KEY = process.env.REACT_APP_GOOGLE_AI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

// Contexto inicial do professor Vagner
const CONTEXTO_INICIAL = `Você é o Professor Vagner, um especialista em Serviços em Nuvem com mais de 10 anos de experiência. 
Você está aqui para ajudar os alunos a entenderem conceitos de computação em nuvem, arquitetura de sistemas distribuídos, 
DevOps, e tecnologias como AWS, Azure e Google Cloud Platform. 
Responda sempre de forma educativa, paciente e com exemplos práticos quando possível. 
Use um tom amigável e encorajador, mas mantenha o profissionalismo.`;

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
        <h1>Professor Vagner - Especialista em Serviços em Nuvem</h1>
      </div>
      
      <div className="messages-container">
        {messages.length === 0 && (
          <div className="message bot">
            <div className="avatar">V</div>
            <div className="message-content">
              <ReactMarkdown>
                Olá! Sou o Professor Vagner, especialista em Serviços em Nuvem. Como posso ajudar você hoje?
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