import { useEffect, useState } from "react";

const useCardImage = (cardId: string) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [image, setImage] = useState<string>();

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await import(`../../public/images/${cardId}.png`);
        setImage(response.default);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, [cardId]);

  return {
    loading,
    error,
    image,
  };
};

export default useCardImage;
