import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import '../styles/Chat.css';
import { sendMessage } from '../api/map';
import { getProfile } from '../api/profile';

export default function Chatbot() {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([
        { id: 1, text: "Xin chào! Tôi là trợ lý ảo Navi. Hôm nay bạn muốn đi đâu?", sender: 'bot' }
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(false);
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);

    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (inputText.trim() === '' || isLoading) return;

        const userMessage = { id: Date.now(), text: inputText, sender: 'user' };
        setMessages(prevMessages => [...prevMessages, userMessage]);
        const currentInput = inputText;
        setInputText('');
        setIsLoading(true);

        try {
            const response = await sendMessage(currentInput);
            const botMessage = {
                id: Date.now(),
                text: response.data.answer,
                sender: 'bot'
            };
            setMessages(prevMessages => [...prevMessages, botMessage]);

        } catch (error) {
            console.error("Failed to get response from AI:", error);
            const errorMessage = {
                id: Date.now(),
                text: "Sorry, I'm having trouble connecting. Please try again.",
                sender: 'bot'
            };
            setMessages(prevMessages => [...prevMessages, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    // The rest of the component remains the same...
    const handleBackToMap = () => {
        document.body.classList.add('page-transitioning');
        navigate('/map');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    useEffect(() => {
        if (loadingProfile) return;
        setLoadingProfile(true);
        getProfile()
            .then(r => setUser(r.data))
            .catch(err => {
                console.error('Failed to load profile', err)
            })
            .finally(setLoadingProfile(false));
        console.log('User profile loaded in check-in page');
        console.log(user);
    }, [])

    //Animation
    useEffect(() => {
    document.body.classList.remove('page-transitioning');
    
    const pageContent = document.querySelector('.check-in-page');
    if (pageContent) {
        pageContent.classList.add('page-enter');
    }
    }, []);

    return (
        <div className="chatbot-page">
            <div className="chat-header">
                <button className="back-button" onClick={handleBackToMap}>
                    <img src = '/src/public/back.png' width = '18px' height = '18px'/>
                </button>
                
                <span className = 'chat-title'>Navi</span>
                
            </div>
            <div className="chat-window">
                <div className="messages-container" ref={messagesContainerRef}>
                    {messages.map((message) => (
                        <div key={message.id} className={`message-wrapper ${message.sender === 'user' ? 'user-wrapper' : 'bot-wrapper'}`}>
                            <div className = {`message-header ${message.sender === 'user' ? 'user-header' : 'bot-header'}`}>
                                {message.sender == 'user' ? (
                                    <>
                                        <span>{user.full_name}</span>
                                        <img src = {user.avatar_url} height = "20px" width = "20px"></img>
                                    </>
                                ) : (
                                    <>
                                        <img src = 'src/public/ecopoint.png' height = "20px" width = "20px"></img>
                                        <span>Navi</span>
                                    </>
                                )}
                                
                            </div>
                            <div
                                className={`message-content ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
                            >
                                {message.text}
                            </div>
                        </div>
                    ))}
                    {isLoading && <div className="message-content bot-message message-pending">...</div>}
                    <div className = 'chat-bottom-spacer' ref={messagesEndRef} />
                </div>
                <div className="chat-input-area">
                    <input
                        type="text"
                        className="chat-input"
                        placeholder="Type your message..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyPress={handleKeyPress}
                    />
                    <button
                        className="chat-send-button"
                        onClick={handleSendMessage}
                        disabled={isLoading || inputText.trim() === ''}
                    >
                        <img src="/src/public/up-arrow 1.png" width="20px" height="20px" />
                    </button>
                </div>
            </div>
        </div>
    );
}