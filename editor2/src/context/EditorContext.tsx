/**
 * Editor Context - 全局状态管理
 * 替代 window 对象传递，提供类型安全的状态共享
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CommandCard } from '../types/command-card';

interface EditorContextValue {
  cards: CommandCard[];
  setCards: React.Dispatch<React.SetStateAction<CommandCard[]>>;
  selectedCard: CommandCard | null;
  setSelectedCard: React.Dispatch<React.SetStateAction<CommandCard | null>>;
}

const EditorContext = createContext<EditorContextValue | null>(null);

interface EditorProviderProps {
  children: ReactNode;
}

export const EditorProvider: React.FC<EditorProviderProps> = ({ children }) => {
  const [cards, setCards] = useState<CommandCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<CommandCard | null>(null);

  const value: EditorContextValue = {
    cards,
    setCards,
    selectedCard,
    setSelectedCard,
  };

  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  );
};

/**
 * 获取所有卡片
 */
export const useEditorCards = (): CommandCard[] => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditorCards must be used within EditorProvider');
  }
  return context.cards;
};

/**
 * 获取和设置卡片的完整API
 */
export const useEditorContext = (): EditorContextValue => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditorContext must be used within EditorProvider');
  }
  return context;
};

/**
 * 获取当前选中的卡片
 */
export const useSelectedCard = (): CommandCard | null => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useSelectedCard must be used within EditorProvider');
  }
  return context.selectedCard;
};
