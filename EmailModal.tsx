import React, { useState } from 'react';
import { X } from 'lucide-react';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  lastBotMessage: string;
}

const EmailModal: React.FC<EmailModalProps> = ({ isOpen, onClose, lastBotMessage }) => {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    try {
      const emailResponse = await fetch('http://localhost:8080/send_email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          subject: 'Police Report Summary',
          body: lastBotMessage,
        }),
      });

      if (!emailResponse.ok) {
        throw new Error('Failed to send email');
      }

      const emailData = await emailResponse.json();

      if (emailData.success) {
        alert('Email sent successfully!');
        onClose();
      } else {
        throw new Error(emailData.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to send email. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-[#1A2B4B] rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#FFD700]">Email Police Report</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block mb-2 font-medium text-white">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2 bg-[#0A1930] border border-[#FFD700] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD700] text-white"
            />
          </div>
          <button
            type="submit"
            disabled={sending}
            className="w-full bg-[#FFD700] text-[#0A1930] p-2 rounded-lg hover:bg-[#FFC000] transition-colors disabled:bg-gray-600"
          >
            {sending ? 'Sending...' : 'Send Email'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmailModal;
