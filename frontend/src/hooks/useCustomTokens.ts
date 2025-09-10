"use client";
import { useState, useEffect } from 'react';
import { TOKENS, Token } from '@/lib/tokens';

export function useCustomTokens() {
  const [customTokens, setCustomTokens] = useState<Token[]>([]);

  useEffect(() => {
    // Load custom tokens from local storage on component mount
    const storedTokens = localStorage.getItem('shroud-custom-tokens');
    if (storedTokens) {
      setCustomTokens(JSON.parse(storedTokens));
    }
  }, []);

  const addCustomToken = (token: Token) => {
    const newTokens = [...customTokens, token];
    setCustomTokens(newTokens);
    localStorage.setItem('shroud-custom-tokens', JSON.stringify(newTokens));
  };

  const allTokens = [...TOKENS, ...customTokens];

  return { allTokens, addCustomToken };
}