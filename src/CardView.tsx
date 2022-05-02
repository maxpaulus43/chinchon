import React from "react";
import useCardImage from "./hooks/useImage";
import { ChinchonCard } from "./Model";

interface CardViewProps {
  card?: ChinchonCard;
}

const CardView: React.FC<CardViewProps> = ({ card }) => {

  const { loading, error, image } = useCardImage(`${card?.id ?? "none"}`);

  if (loading) {
    return <span>Loading...</span>;
  }
  if (error) {
    return <span>Error!</span>;
  }
  return <img className="w-14 aspect-auto" src={image} alt={card?.id ?? "none"} />;
};

export default CardView;
