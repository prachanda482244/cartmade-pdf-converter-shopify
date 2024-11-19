import { useState } from "react";
import { motion } from "framer-motion";

// Define the type for each animation
interface AnimationType {
  id: number;
  name: string;
  key: string;
  animationClass: string;
}

const AnimationTypes: React.FC = () => {
  // State to track the selected animation
  const [selectedAnimation, setSelectedAnimation] =
    useState<AnimationType | null>(null);

  // List of animations
  const animationTypes: AnimationType[] = [
    {
      id: 1,
      name: "Book Flip",
      key: "bookFlip",
      animationClass: "animate-bookFlip",
    },
    {
      id: 2,
      name: "Slide In",
      key: "slideIn",
      animationClass: "animate-slideIn",
    },
    {
      id: 3,
      name: "Fade In",
      key: "fadeIn",
      animationClass: "animate-fadeIn",
    },
    {
      id: 4,
      name: "Bounce",
      key: "bounce",
      animationClass: "animate-bounce",
    },
    {
      id: 5,
      name: "Rotate",
      key: "rotate",
      animationClass: "animate-rotate",
    },
  ];

  const handleWheelAnimation = () => {
    return selectedAnimation?.key === "rotate"
      ? {
          x: "100vw",
          rotate: 720,
          transition: {
            type: "spring",
            stiffness: 100,
            damping: 20,
            duration: 2,
          },
        }
      : {};
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-semibold text-gray-800 text-center mb-6">
        Animation Types
      </h2>

      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 text-center mb-4">
          Animation Preview
        </h3>

        <motion.div
          className={`w-64 h-64 bg-gray-200 border border-gray-300 transition-all duration-500 ease-in-out ${
            selectedAnimation ? selectedAnimation.animationClass : ""
          } ${selectedAnimation?.key === "rotate" ? "rounded-full border border-red-400" : "rounded-lg"}`}
          initial={{ borderRadius: "0%" }}
          animate={{
            borderRadius: selectedAnimation?.key === "rotate" ? "100%" : "0%",
            ...handleWheelAnimation(),
          }}
        >
          <p className="text-center text-gray-600 mt-28">
            {selectedAnimation ? selectedAnimation.name : "Select an Animation"}
          </p>
        </motion.div>
      </div>

      {/* Animation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {animationTypes.map((animation) => (
          <div
            key={animation.id}
            className="border border-gray-200 rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow duration-300 ease-in-out"
          >
            <div className="text-center">
              <h3 className="text-xl font-medium text-gray-900">
                {animation.name}
              </h3>
              <p className="text-gray-600 text-sm mt-2">{animation.key}</p>
            </div>
            <div className="mt-4">
              <button
                className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors duration-200"
                onClick={() => setSelectedAnimation(animation)}
              >
                Apply Animation
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnimationTypes;
