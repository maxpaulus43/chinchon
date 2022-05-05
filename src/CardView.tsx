import React from "react";
import useCardImage from "./hooks/useImage";
import { ChinchonCard } from "./Model";

interface CardViewProps {
  card?: ChinchonCard;
  showBack?: boolean;
  highlight?: boolean;
}

const CardView: React.FC<CardViewProps> = ({ card, showBack, highlight }) => {
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
      className={`w-24 aspect-auto ${
        highlight ? "-translate-y-4 transition" : ""
      }`}
      src={image}
      alt={card?.id ?? "none"}
    />
  );
};

export default CardView;
