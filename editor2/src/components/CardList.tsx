import React, { useState, useMemo } from 'react';
import {
  CommandCard,
  CardSortOptions,
  CardFilterOptions,
  sortCards,
  filterCards,
  groupCardsByTime,
  CardGroup,
} from '../types/command-card';
import { Card } from './Card';
import './CardList.css';

interface CardListProps {
  cards: CommandCard[];
  onCardClick?: (card: CommandCard) => void;
}

export const CardList: React.FC<CardListProps> = ({
  cards,
  onCardClick,
}) => {
  const [sortOptions, setSortOptions] = useState<CardSortOptions>({
    mode: 'time',
    reverse: false,
  });

  const [filterOptions, setFilterOptions] = useState<CardFilterOptions>({});
  const [groupByTime, setGroupByTime] = useState<boolean>(false);
  const [timeInterval, setTimeInterval] = useState<number>(5);

  // 过滤和排序卡片
  const processedCards = useMemo(() => {
    const filtered = filterCards(cards, filterOptions);
    return sortCards(filtered, sortOptions);
  }, [cards, filterOptions, sortOptions]);

  // 分组显示
  const cardGroups = useMemo(() => {
    if (!groupByTime) {
      return [
        {
          id: 'all',
          title: '所有命令',
          cards: processedCards,
        },
      ];
    }
    return groupCardsByTime(processedCards, timeInterval);
  }, [processedCards, groupByTime, timeInterval]);

  const handleSortChange = (mode: 'time' | 'filePosition' | 'type') => {
    setSortOptions((prev) => ({
      mode,
      reverse: prev.mode === mode ? !prev.reverse : false,
    }));
  };

  const handleFilterChange = (key: keyof CardFilterOptions, value: any) => {
    setFilterOptions((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="card-list">
      <div className="card-list-stats">
        显示 {processedCards.length} / {cards.length} 个命令
      </div>

      <div className="card-list-content">
        {cardGroups.map((group) => (
          <div key={group.id} className="card-group">
            {cardGroups.length > 1 && (
              <div className="card-group-header">
                <h3>{group.title}</h3>
                <span className="card-group-count">({group.cards.length})</span>
              </div>
            )}
            <div className="card-group-content">
              {group.cards.map((card) => (
                <Card
                  key={card.id}
                  card={card}
                  onClick={onCardClick}
                />
              ))}
            </div>
          </div>
        ))}

        {processedCards.length === 0 && (
          <div className="card-list-empty">
            <p>没有找到匹配的命令</p>
          </div>
        )}
      </div>
    </div>
  );
};
