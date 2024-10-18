import React, { useState, useEffect } from 'react';
import { Send, Mic, Paperclip, StopCircle, VolumeX, Volume2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatInterfaceProps {
  currentChat: string | null;
  onClearChat: () => void;
  setLastBotMessage: (message: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ currentChat, onClearChat, setLastBotMessage }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    setMessages([]);
  }, [currentChat]);

  useEffect(() => {
    const loadVoices = () => {
      // Trigger the voice loading
      speechSynthesis.getVoices();
    };

    loadVoices();
    
    // Some browsers need a little time to load voices
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages([...messages, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8080/ask_bot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationsNew: messages.map(msg => ({ messages: [{ sender: msg.role, text: msg.content }] })),
          question: input,
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      const assistantMessage: Message = { role: 'assistant', content: data.response };
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
      setLastBotMessage(data.response);
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while fetching the response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('File uploaded:', file.name);
      // Implement file handling logic here
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Implement voice recording logic here
  };

  const speakMessage = (message: string) => {
    if ('speechSynthesis' in window) {
      // Stop any ongoing speech
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(message);
      
      // Get available voices
      const voices = speechSynthesis.getVoices();
      
      // Try to find an Indian English female voice
      const preferredVoice = voices.find(voice => 
        voice.lang === 'en-IN' && 
        voice.name.toLowerCase().includes('female')
      );

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      } else {
        // Fallback to any English female voice
        const femaleEnglishVoice = voices.find(voice => 
          voice.lang.startsWith('en') && 
          voice.name.toLowerCase().includes('female')
        );
        if (femaleEnglishVoice) {
          utterance.voice = femaleEnglishVoice;
        } else {
          // If no female voice is found, use the default voice
          console.warn('No suitable female English voice found. Using default voice.');
        }
      }

      // Adjust speech parameters for more natural Indian English sound
      utterance.rate = 0.9; // Slightly slower rate for clearer speech
      utterance.pitch = 1.1; // Slightly higher pitch for a female voice
      utterance.volume = 0.95; // Slightly lower volume for a softer tone

      // Add some variety to the speech rhythm
      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          // Add slight pauses between words
          speechSynthesis.pause();
          setTimeout(() => speechSynthesis.resume(), 10);
        }
      };

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);

      speechSynthesis.speak(utterance);
    } else {
      console.error('Speech synthesis not supported');
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0A1930]">
      {currentChat ? (
        <>
          <div className="flex-grow overflow-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`p-3 rounded-lg max-w-[70%] ${
                    message.role === 'user'
                      ? 'bg-[#1A2B4B] text-white'
                      : 'bg-[#FFD700] text-[#0A1930]'
                  }`}
                >
                  <div className="flex items-start">
                    {message.role === 'assistant' && (
                      <>
                        <img
                          src="/nagar-rakshak-avatar.png"
                          alt="Nagar Rakshak Avatar"
                          className="w-8 h-8 rounded-full mr-2"
                        />
                        <button
                          onClick={() => speakMessage(message.content)}
                          className="ml-2 text-[#0A1930] hover:text-[#1A2B4B] transition-colors"
                        >
                          {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
                        </button>
                      </>
                    )}
                    <div>{message.content}</div>
                    {message.role === 'user' && (
                      <img
                        src="/user-avatar.png"
                        alt="User Avatar"
                        className="w-8 h-8 rounded-full ml-2"
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FFD700]"></div>
              </div>
            )}
            {error && (
              <div className="text-red-500 text-center">{error}</div>
            )}
          </div>
          <form onSubmit={handleSubmit} className="p-4 border-t border-[#1A2B4B]">
            <div className="flex items-center space-x-2 bg-[#1A2B4B] rounded-full p-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="How can I assist you today?"
                className="flex-grow p-2 bg-transparent focus:outline-none text-white"
              />
              <label className="cursor-pointer">
                <Paperclip size={20} className="text-gray-400 hover:text-[#FFD700] transition-colors" />
                <input type="file" className="hidden" onChange={handleFileUpload} />
              </label>
              <button
                type="button"
                onClick={toggleRecording}
                className="text-gray-400 hover:text-[#FFD700] transition-colors"
              >
                {isRecording ? <StopCircle size={20} /> : <Mic size={20} />}
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="bg-[#FFD700] text-[#0A1930] p-2 rounded-full hover:bg-[#FFC000] transition-colors disabled:opacity-50"
              >
                <Send size={20} />
              </button>
            </div>
          </form>
        </>
      ) : (
        <div className="flex-grow flex flex-col items-center justify-center p-4">
          <h2 className="text-4xl font-serif font-bold mb-8 text-[#FFD700]">Nagar Rakshak</h2>
          <div className="text-center text-white mb-8">
            <p>AI-Powered Police Assistant for Goa Police Department</p>
          </div>
          <div className="grid grid-cols-3 gap-4 max-w-3xl w-full">
            <FeatureCard
              title="Examples"
              items={[
                '"How do I file a complaint?"',
                '"What are the steps for reporting a theft?"',
                '"Can you explain the process of getting a police clearance certificate?"',
              ]}
              suggestions={[
                "Guide me through the FIR filing process",
                "What should I do if I witness a crime?",
                "How can I contact the nearest police station?"
              ]}
            />
            <FeatureCard
              title="Capabilities"
              items={[
                "Guides through police station procedures",
                "Conducts preliminary investigations",
                "Generates police reports and emails them",
              ]}
              suggestions={[
                "Help me understand the sections of law applicable to my case",
                "What are my rights during a police interrogation?",
                "Generate a preliminary report for a missing person case"
              ]}
            />
            <FeatureCard
              title="Limitations"
              items={[
                "Cannot replace human police officers for critical tasks",
                "May not have real-time information on ongoing cases",
                "Legal advice should be confirmed with authorized personnel",
              ]}
              suggestions={[
                "When should I speak directly to a police officer?",
                "How can I verify the authenticity of police communications?",
                "What are the limitations of AI in law enforcement?"
              ]}
            />
          </div>
        </div>
      )}
    </div>
  );
};

interface FeatureCardProps {
  title: string;
  items: string[];
  suggestions: string[];
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, items, suggestions }) => (
  <div className="bg-[#1A2B4B] p-4 rounded-lg shadow-md border border-[#FFD700]">
    <h3 className="text-lg font-semibold mb-2 text-[#FFD700]">{title}</h3>
    <ul className="space-y-2 mb-4">
      {items.map((item, index) => (
        <li key={index} className="text-sm text-white">{item}</li>
      ))}
    </ul>
    <h4 className="text-md font-semibold mb-2 text-[#FFD700]">Try asking:</h4>
    <ul className="space-y-2">
      {suggestions.map((suggestion, index) => (
        <li key={index} className="text-sm text-white cursor-pointer hover:text-[#FFD700] transition-colors">
          {suggestion}
        </li>
      ))}
    </ul>
  </div>
);

export default ChatInterface;
