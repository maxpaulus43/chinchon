import React from "react";
import useCardImage from "./hooks/useImage";
import { ChinchonCard } from "./Model";

interface CardViewProps {
  card?: ChinchonCard;
  showBack?: boolean;
}

const CardView: React.FC<CardViewProps> = ({ card, showBack }) => {
  const { loading, error, image } = useCardImage(
    `${showBack ? "card_back" : card?.id ?? "none"}`
  );

  if (loading) {
    return <span>🃏</span>;
  }
  if (error) {
    return <span>Error!</span>;
  }
  return (
    <img
      className="shadow-2xl"
      src={image}
      alt={showBack ? "face down card" : card?.id ?? "no card"}
    />
  );
};

export default CardView;
