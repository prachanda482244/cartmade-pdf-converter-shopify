import React, { useState } from "react";
import { motion } from "framer-motion";

const PageFlip = ({ images }: { images: string[] }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [animate, setAnimate] = useState(false);
  const [markers, setMarkers] = useState<
    { x: number; y: number; imageIndex: number; product: string }[]
  >([]);

  const handleNextPage = () => {
    if (currentPage < images.length - 2) {
      setAnimate(true);
      setCurrentPage(currentPage + 2);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setAnimate(true);
      setCurrentPage(currentPage - 2);
    }
  };

  const handleImageMarker = async (
    event: React.MouseEvent<HTMLImageElement>,
    imageIndex: number,
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Open the Shopify Resource Picker
    const selected = await shopify.resourcePicker({
      type: "product",
      multiple: true,
      filter: {
        variants: false,
        archived: false,
        draft: false,
      },
    });

    if (!selected) return;
    if (selected?.length > 0) {
      setMarkers((prevMarkers) => [
        ...prevMarkers,
        { x, y, imageIndex, product: selected[0].title },
      ]);
    }
  };
  console.log(markers);
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="relative w-[900px] h-[550px] perspective-1000">
        <motion.div
          className="absolute flex w-full h-full bg-white rounded-lg shadow-lg"
          initial={{ rotateY: 0, zIndex: 0 }}
          animate={{
            rotateY: animate ? (currentPage % 2 === 0 ? 0 : -180) : 0,
            zIndex: currentPage % 2 === 0 ? 0 : 1,
          }}
          transition={{ duration: 0.6 }}
          style={{ transformOrigin: "right center" }}
          onAnimationComplete={() => setAnimate(false)}
        >
          <img
            src={images[currentPage]}
            alt={`Page ${currentPage + 1}`}
            className="w-full h-full object-cover rounded-tl-lg rounded-bl-lg"
            onClick={(event) => handleImageMarker(event, currentPage)}
          />
          <img
            src={
              currentPage + 1 < images.length
                ? images[currentPage + 1]
                : images[currentPage]
            }
            alt={`Page ${currentPage + 2}`}
            className="w-full h-full object-cover rounded-tr-lg rounded-br-lg"
            onClick={(event) => handleImageMarker(event, currentPage + 1)}
          />
          {markers.map((marker, index) =>
            marker.imageIndex === currentPage ? (
              <div
                key={index}
                className="absolute"
                style={{
                  left: marker.x,
                  top: marker.y,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div className="bg-blue-500 w-2 h-2 rounded-full" />
                <div className="absolute left-1/2 transform -translate-x-1/2 mt-1 text-xs text-white bg-black p-1 rounded">
                  {marker.product}
                </div>
              </div>
            ) : marker.imageIndex === currentPage + 1 ? (
              <div
                key={index}
                className="absolute"
                style={{
                  left: marker.x,
                  top: marker.y,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div className="bg-blue-500 w-2 h-2 rounded-full" />
                <div className="absolute left-1/2 transform -translate-x-1/2 mt-1 text-xs text-white bg-black p-1 rounded">
                  {marker.product}
                </div>
              </div>
            ) : null,
          )}
        </motion.div>
      </div>

      <div className="flex justify-between w-full mt-4">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 0}
          className={`px-4 py-2 text-white rounded ${
            currentPage === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-700"
          }`}
        >
          Prev
        </button>
        <button
          onClick={handleNextPage}
          disabled={currentPage >= images.length - 1}
          className={`px-4 py-2 text-white rounded ${
            currentPage >= images.length - 2
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-700"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PageFlip;
