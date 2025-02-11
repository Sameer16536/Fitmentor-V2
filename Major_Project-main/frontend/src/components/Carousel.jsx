import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const Carousel = ({ slides }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(null);

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset, velocity) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => (prevIndex + newDirection + slides.length) % slides.length);
  };

  return (
    <div className="relative h-[600px] w-full flex items-center justify-center overflow-hidden">
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={(e, { offset, velocity }) => {
            const swipe = swipePower(offset.x, velocity.x);
            if (swipe < -swipeConfidenceThreshold) {
              paginate(1);
            } else if (swipe > swipeConfidenceThreshold) {
              paginate(-1);
            }
          }}
          className="absolute w-full h-full"
          style={{ overflow: 'hidden' }}
        >
          <div className="w-full h-full relative rounded-lg overflow-hidden">
            <img
              src={slides[currentIndex].image}
              alt={slides[currentIndex].name}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
              <h2 className="text-3xl font-bold text-white mb-2">
                {slides[currentIndex].name}
              </h2>
              <p className="text-gray-200 mb-4">
                {slides[currentIndex].description}
              </p>
              <div className="flex gap-4">
                {slides[currentIndex].buttons.map((button, index) => (
                  <button
                    key={index}
                    onClick={button.onClick}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    {button.text}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <button
        className="absolute left-4 z-10 p-2 rounded-full bg-white/30 hover:bg-white/50 transition-colors"
        onClick={() => paginate(-1)}
      >
        <ChevronLeftIcon className="text-white" />
      </button>
      <button
        className="absolute right-4 z-10 p-2 rounded-full bg-white/30 hover:bg-white/50 transition-colors"
        onClick={() => paginate(1)}
      >
        <ChevronRightIcon className="text-white" />
      </button>
    </div>
  );
};

export default Carousel;