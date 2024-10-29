import React, { useState } from "react";
import { motion } from "framer-motion";

const books = [
  { id: 1, text: "Page 1: Introduction to Books" },
  { id: 2, text: "Page 2: The Art of Reading" },
  { id: 3, text: "Page 3: Genres of Literature" },
  { id: 4, text: "Page 4: The Importance of Storytelling" },
];

const BookFlip = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  const handleNext = () => {
    if (isFlipping || currentIndex >= books.length - 1) return;
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentIndex(currentIndex + 1);
      setIsFlipping(false);
    }, 800); // Duration of flip animation
  };

  const handlePrev = () => {
    if (isFlipping || currentIndex <= 0) return;
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentIndex(currentIndex - 1);
      setIsFlipping(false);
    }, 800);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="flex items-center gap-4" style={{ perspective: 1000 }}>
        <button
          onClick={handlePrev}
          className="bg-blue-400 text-white font-semibold py-2 px-4 rounded shadow-lg"
          disabled={isFlipping || currentIndex <= 0}
        >
          Prev
        </button>

        <motion.div
          className="bg-white h-60 w-40 shadow-lg rounded-l-lg"
          style={{
            transformOrigin: "left center",
            zIndex: 1,
          }}
          // animate={{
          //   rotateY: isFlipping ? -180 : 0,
          //   opacity: isFlipping ? 0 : 1,
          // }}
          transition={{ duration: 0.4 }}
        >
          <div className="p-4">{books[currentIndex + 1].text}</div>
        </motion.div>
        <motion.div
          className="bg-white h-60 w-40 shadow-lg rounded-r-lg"
          style={{
            transformOrigin: "left center",
            zIndex: 1,
          }}
          animate={{
            rotateY: isFlipping ? -180 : 0,
            opacity: isFlipping ? 0 : 1,
          }}
          transition={{ duration: 0.4 }}
        >
          <div className="p-4">{books[currentIndex + 2].text}</div>
        </motion.div>

        {/* Right Page */}
        {/* <motion.div
          className="bg-white h-60 w-40 shadow-lg rounded-r-lg"
          style={{
            transformOrigin: "right center",
            zIndex: 1,
          }}
          animate={{
            rotateY: isFlipping ? 0 : -180,
            opacity: isFlipping ? 1 : 0,
          }}
          transition={{ duration: 0.4 }}
        >
          <div className="p-4">
            {currentIndex + 1 < books.length ? (
              books[currentIndex + 1].text
            ) : (
              <div>End of Book</div>
            )}
          </div>
        </motion.div> */}

        {/* Next Button */}
        <button
          onClick={handleNext}
          className="bg-blue-400 text-white font-semibold py-2 px-4 rounded shadow-lg"
          disabled={isFlipping || currentIndex >= books.length - 1}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default BookFlip;
