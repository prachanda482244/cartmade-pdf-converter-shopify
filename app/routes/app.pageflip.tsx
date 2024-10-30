import React, { useState, MouseEvent } from "react";
import { motion } from "framer-motion";
import Draggable from "react-draggable";
import { useActionData, useFetcher } from "@remix-run/react";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { IMAGES, Marker } from "app/constants/types";
import { image, marker } from "framer-motion/client";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const markers = formData.get("markers") as string;
  const metaFieldId: any = formData.get("metaFieldId");

  console.log("Received markers:", markers);
  console.log("Received metaFieldId:", metaFieldId);

  const metafieldData = await fetchMetafieldData(metaFieldId);
  console.log("Fetched metafield data:", metafieldData);

  return json({ success: true, markers, metafieldData });
};
async function fetchMetafieldData(metaFieldId: string) {
  return { exampleData: "Example metafield data" };
}
const PageFlip = ({ images, metaFieldId }: IMAGES) => {
  const actionData = useActionData();

  const colorPalette = [
    "#FF5733",
    "#FF8D1A",
    "#FFC300",
    "#DAF7A6",
    "#33FF57",
    "#33C7FF",
    "#6A33FF",
  ];

  const [currentPage, setCurrentPage] = useState<number>(0);
  const [animate, setAnimate] = useState<boolean>(false);
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<Marker | null>(null);
  const handleNextPage = () => {
    if (currentPage < images.length - 2) {
      setAnimate(true);
      setCurrentPage((prevPage) => prevPage + 2);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setAnimate(true);
      setCurrentPage((prevPage) => prevPage - 2);
    }
  };

  const handleImageMarker = async (
    event: MouseEvent<HTMLImageElement>,
    imageIndex: number,
    isRightImage: boolean,
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const adjustedX = isRightImage ? x + rect.width : x;

    const selected: any = await shopify.resourcePicker({
      type: "product",
      multiple: 1,
      filter: { variants: false, archived: false, draft: false },
    });

    if (selected && selected.length > 0) {
      setMarkers((prevMarkers) => [
        ...prevMarkers,
        {
          x: adjustedX,
          y,
          imageIndex,
          product: selected[0].title,
          productId: selected[0].id,
          productImage: selected[0]?.images[0]?.originalSrc,
          color: colorPalette[prevMarkers.length % colorPalette.length],
        },
      ]);
    }
  };

  const handleMarkerClick = (marker: Marker) => {
    setSelectedMarker(marker);
  };

  const handleRemoveMarker = () => {
    if (selectedMarker) {
      setMarkers((prevMarkers) =>
        prevMarkers.filter((marker) => marker !== selectedMarker),
      );
      setSelectedMarker(null);
    }
  };

  const handleDragStop = (e: MouseEvent, data: any, markerIndex: number) => {
    const pageWidth = 450;
    const newMarkers = [...markers];
    const marker = newMarkers[markerIndex];

    if (marker) {
      if (data.x < pageWidth && marker.imageIndex % 2 === 1) {
        marker.imageIndex = marker.imageIndex - 1;
      } else if (data.x >= pageWidth && marker.imageIndex % 2 === 0) {
        marker.imageIndex = marker.imageIndex + 1;
      }
      marker.x = data.x;
      marker.y = data.y;
      setMarkers(newMarkers);
      setCurrentPage(
        marker.imageIndex % 2 === 0 ? marker.imageIndex : marker.imageIndex - 1,
      );
    }
  };

  const handleSave = () => {
    console.log("Markers before saving:", markers);

    images.forEach((image) => {
      const imageMarkers = markers.filter(
        (marker) => marker.imageIndex === image.id - 1,
      );

      if (imageMarkers.length > 0) {
        if (!image.points) {
          image.points = [];
        }

        imageMarkers.forEach((marker) => {
          const existingPoint = image.points?.some(
            ({ productId }) => productId === marker.productId,
          );

          if (!image.points) return;
          if (!existingPoint) {
            image.points.push(marker);
          }
        });
      } else {
        if (image.points) {
          delete image.points;
        }
      }
    });

    console.log("Updated images:", images);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="flex items-center justify-end py-1">
        <button
          onClick={handleSave}
          className="bg-blue-500 hover:bg-blue-700 text-white rounded-lg  shadow-md  py-1 px-2"
        >
          Save
        </button>
      </div>
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
            src={images[currentPage].url}
            alt={`Page ${currentPage + 1}`}
            className="w-1/2 h-full object-cover rounded-tl-lg rounded-bl-lg"
            onClick={(event) => handleImageMarker(event, currentPage, false)}
          />
          <img
            src={
              currentPage + 1 < images.length
                ? images[currentPage + 1].url
                : images[currentPage].url
            }
            alt={`Page ${currentPage + 2}`}
            className="w-1/2 h-full object-cover rounded-tr-lg rounded-br-lg"
            onClick={(event) => handleImageMarker(event, currentPage + 1, true)}
          />
          {markers.map(
            (marker, index) =>
              (marker.imageIndex === currentPage ||
                marker.imageIndex === currentPage + 1) && (
                <Draggable
                  key={index}
                  defaultPosition={{ x: marker.x, y: marker.y }}
                  onStop={(e: any, data) => handleDragStop(e, data, index)}
                >
                  <div
                    className="absolute flex justify-between items-center text-white text-sm px-3 p-1 rounded-full shadow-lg cursor-pointer"
                    style={{ backgroundColor: marker.color }}
                    onDoubleClick={() => handleMarkerClick(marker)}
                  >
                    <span className="mr-2">{marker.product.slice(0, 3)}..</span>
                    <button
                      className="bg-gray-600 hover:bg-gray-700 rounded-full w-4 h-4 flex items-center justify-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMarkers((prevMarkers) =>
                          prevMarkers.filter((m) => m !== marker),
                        );
                      }}
                    >
                      <span className="text-xs font-bold text-white">×</span>
                    </button>
                  </div>
                </Draggable>
              ),
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

      {selectedMarker && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg w-3/4 max-w-3xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                {selectedMarker.product}
              </h2>
              <button
                onClick={() => setSelectedMarker(null)}
                className="text-gray-600 hover:text-gray-800"
              >
                &times;
              </button>
            </div>
            <img
              src={selectedMarker.productImage}
              alt={selectedMarker.product}
              className="w-full h-48 object-contain mb-4"
            />
            <p>More details here...</p>
            <button
              onClick={handleRemoveMarker}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Remove Product
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageFlip;
