import React, { createContext, useContext, useState, useEffect } from 'react';

const VoiceContext = createContext();

export function VoiceProvider({ children }) {
  const [isSupported, setIsSupported] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
    }
  }, []);

  const speak = (text) => {
    if (!isSupported || !voiceEnabled) return;
    try {
      window.speechSynthesis.cancel(); // cancel previous
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID';
      utterance.rate = 0.95; // clear and calm
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        setIsPlaying(true);
        setCurrentText(text);
      };
      utterance.onend = () => {
        setIsPlaying(false);
        setCurrentText('');
      };
      utterance.onerror = () => {
        setIsPlaying(false);
        setCurrentText('');
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error', e);
    }
  };

  const stop = () => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setCurrentText('');
    }
  };

  const toggleVoice = () => {
    const nextState = !voiceEnabled;
    setVoiceEnabled(nextState);
    if (!nextState) {
      stop();
    } else {
      speak("Fitur panduan suara SAPA-JARAK aktif. Kami siap membantu memandu pengisian formulir.");
    }
  };

  return (
    <VoiceContext.Provider value={{ isSupported, isPlaying, voiceEnabled, toggleVoice, speak, stop, currentText }}>
      {children}
    </VoiceContext.Provider>
  );
}

export function useVoice() {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
}
