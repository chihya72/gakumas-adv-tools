import React from 'react';
import { CommandCard, formatTime, getCommandIcon, getCommandColorClass } from '../types/command-card';
import './Card.css';

interface CardProps {
  card: CommandCard;
  onClick?: (card: CommandCard) => void;
}

export const Card: React.FC<CardProps> = ({ card, onClick }) => {
  const colorClass = getCommandColorClass(card.type);
  const icon = getCommandIcon(card.type);

  const handleClick = () => {
    if (onClick) {
      onClick(card);
    }
  };

  return (
    <div
      className={`card card-${colorClass} ${card.selected ? 'card-selected' : ''} ${
        card.highlighted ? 'card-highlighted' : ''
      }`}
      onClick={handleClick}
    >
      <div className="card-header">
        <span className="card-icon">{icon}</span>
        <span className="card-type">{card.type}</span>
        {card.clip && (
          <span className="card-time">{formatTime(card.clip.startTime)}</span>
        )}
        {!card.clip && card.filePosition !== undefined && 
         card.type !== 'backgroundgroup' && card.type !== 'actorgroup' && (
          <span className="card-position">#{card.filePosition}</span>
        )}
      </div>
      
      <div className="card-title">{card.title}</div>
    </div>
  );
};
