import React, { useEffect, useState } from 'react';
import { Modal } from '../base/Modal';
import styled from 'styled-components';

type Image = {
  src: string,
  alt: string,
}

type ImageViewerProps = {
  isOpen: boolean,
  onClose: () => void,
  images: Image[],
  initialIndex?: number,
}

const Img = styled.img`
  margin-bottom: -4px;
`;

export const ImageViewer = ({ images, initialIndex = 0, isOpen, onClose }: ImageViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(initialIndex >= images.length ? 0 : initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    const changeIndexOnArrowKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setCurrentIndex((index) => index === images.length - 1 ? 0 : index + 1);
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex((index) => index === 0 ? images.length - 1 : index - 1);
      }
    };

    document.body.addEventListener('keydown', changeIndexOnArrowKey);
    return () => {
      document.body.removeEventListener('keydown', changeIndexOnArrowKey);
    };
  }, [images.length]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Img src={images[currentIndex].src} alt={images[currentIndex].alt} />
    </Modal>
  );
};
