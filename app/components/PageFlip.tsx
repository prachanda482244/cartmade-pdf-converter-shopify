import { useState, MouseEvent } from "react";
import { motion } from "framer-motion";
import Draggable from "react-draggable";
import { useFetcher } from "@remix-run/react";
import { IMAGES, Marker } from "app/constants/types";
import { Button, Page, Pagination } from "@shopify/polaris";

const PageFlip = ({ images, metaFieldId, pdfName }: IMAGES) => {
  const fetcher = useFetcher();

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
  const [markers, setMarkers] = useState<Marker[]>(
    images
      .filter((image: any) => image?.points?.length > 0)
      .flatMap((image: any) =>
        image.points.filter((point: Marker | undefined) => point !== undefined),
      ),
  );

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

  // Handle click to add marker on the image
  const handleImageMarker = async (
    event: MouseEvent<HTMLImageElement>,
    imageIndex: number,
    isRightImage: boolean,
  ) => {
    // const container = document.getElementById("image-container")!;
    const rect = event.currentTarget.getBoundingClientRect();

    const x = event.clientX - rect.left; // relative X
    const y = event.clientY - rect.top; // relative Y

    const adjustedX = isRightImage ? x + rect.width : x; // Adjust for right image

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

  console.log(markers, "POINS");
  const handleSave = async () => {
    images.forEach((image) => {
      const imageMarkers = markers.filter(
        ({ imageIndex }) => imageIndex === image.id - 1,
      );
      image.points = [...imageMarkers];
    });

    const formData = new FormData();
    formData.append("images", JSON.stringify(images));
    formData.append("metaFieldId", metaFieldId);
    formData.append("pdfName", pdfName);

    fetcher.submit(formData, { method: "post" });
  };

  return (
    <div className="w-[80%]">
      <Page
        backAction={{ content: "Settings", url: "/app/pdf-convert" }}
        primaryAction={{
          content: "Save",
          onAction: handleSave,
          loading: fetcher.state === "submitting",
        }}
        fullWidth
      >
        <div className="flex flex-col bg-gray-100">
          <div
            className="relative w-[70%] h-[80vh] object-cover mx-auto"
            id="image-container"
          >
            <motion.div
              className="absolute flex w-full  h-full bg-white rounded-lg shadow-lg"
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
                className="w-full cursor-crosshair h-full object-cover bg-blue-500 pl-2 pt-2 pb-2 pr-[1px] rounded-tl-lg rounded-bl-lg"
                onClick={(event) =>
                  handleImageMarker(event, currentPage, false)
                }
              />

              <img
                src={
                  currentPage + 1 < images.length
                    ? images[currentPage + 1].url
                    : images[currentPage].url
                }
                alt={`Page ${currentPage + 2}`}
                className="w-full bg-blue-500 pr-2 pt-2 pb-2 pl-[1px] h-full cursor-crosshair object-cover rounded-tr-lg rounded-br-lg"
                onClick={(event) =>
                  handleImageMarker(event, currentPage + 1, true)
                }
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
                        <span className="mr-2">
                          {marker.product.slice(0, 3)}..
                        </span>
                        <button
                          className="bg-gray-600 hover:bg-gray-700 rounded-full w-4 h-4 flex items-center justify-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMarkers((prevMarkers) =>
                              prevMarkers.filter((m) => m !== marker),
                            );
                          }}
                        >
                          <span className="text-xs font-bold text-white">
                            ×
                          </span>
                        </button>
                      </div>
                    </Draggable>
                  ),
              )}
            </motion.div>
          </div>
          <div className="flex items-center justify-center w-full mt-2">
            <Pagination
              label="Pagination"
              hasPrevious={currentPage !== 0}
              onPrevious={handlePrevPage}
              hasNext={currentPage + 2 < images.length}
              onNext={handleNextPage}
            />
          </div>

          {/* <div className="flex justify-between w-full mt-4">
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
          </div> */}

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
      </Page>
    </div>
  );
};

export default PageFlip;
