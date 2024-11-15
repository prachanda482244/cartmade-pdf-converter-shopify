import { useState, MouseEvent, useCallback } from "react";
import { motion } from "framer-motion";
import Draggable from "react-draggable";
import { useFetcher } from "@remix-run/react";
import { IMAGES, Marker } from "app/constants/types";
import {
  Button,
  LegacyCard,
  Page,
  Pagination,
  RangeSlider,
} from "@shopify/polaris";

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

  const [settings, setSettings] = useState({
    heading: "",
    description: "",
  });
  const [isShowModal, setIsSetModal] = useState<boolean>(false);

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

  if (fetcher.state === "loading") {
    shopify.toast.show("Product saved");
  }
  const [rangeValue, setRangeValue] = useState(100);
  const [verticalRange, setVerticalRange] = useState(50);
  const [mobileRangeValue, setMobileRange] = useState(70);
  const [mobileVerticalRange, setMobileVerticalRange] = useState(20);
  const handleRangeSliderChange = useCallback(
    (value: number) => setRangeValue(value),
    [],
  );
  const handleVerticalRangeSliderChange = useCallback(
    (value: number) => setVerticalRange(value),
    [],
  );

  const handleMobileRangeSliderChange = useCallback(
    (value: number) => setMobileRange(value),
    [],
  );
  const handleMobileRangeVerticalSliderChange = useCallback(
    (value: number) => setMobileVerticalRange(value),
    [],
  );

  console.log(selectedMarker);
  return (
    <div className="w-[80%]">
      <Page
        backAction={{ content: "Settings", url: "/app/pdf-convert" }}
        primaryAction={{
          content: "Save",
          onAction: handleSave,
          loading: fetcher.state === "submitting",
        }}
        secondaryActions={
          <Button onClick={() => alert("settings")}>Settings</Button>
        }
        fullWidth
      >
        <div className="flex gap-2">
          <div className="flex w-full h-full  flex-col bg-gray-100">
            <div
              className="relative h-[80vh]  w-full object-cover mx-auto"
              id="image-container"
            >
              <motion.div
                className=" flex w-full  h-full bg-white rounded-lg shadow-lg"
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
                  className="w-full cursor-crosshair h-full object-cover rounded-tl-lg rounded-bl-lg"
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
                  className="w-full h-full cursor-crosshair object-cover rounded-tr-lg rounded-br-lg"
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
                        onStop={(e: any, data) =>
                          handleDragStop(e, data, index)
                        }
                      >
                        <div
                          className="absolute flex justify-center items-center text-white text-sm h-6 w-6 rounded-full shadow-lg cursor-pointer animate-pulse"
                          style={{ backgroundColor: marker.color }}
                          onClick={() =>
                            setSettings({
                              ...settings,
                              heading: marker.product,
                            })
                          }
                          onDoubleClick={() => handleMarkerClick(marker)}
                        >
                          <span className="w-4 h-4 rounded-full bg-white"></span>
                          {/* <button
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
                        </button> */}
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
            {(selectedMarker || isShowModal) && selectedMarker !== null && (
              <div className={`${!isShowModal ? "hidden" : "block"}`}>
                <Draggable>
                  <div className="bg-white absolute top-20 left-20 z-20  border-black border p-6 rounded-lg ml-20 w-3/4 max-w-3xl shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold">
                        {settings.heading === ""
                          ? "Untitled Product"
                          : settings.heading}
                      </h2>
                      <button
                        onClick={() => setIsSetModal(false)}
                        className="text-gray-600  hover:text-gray-800"
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
                </Draggable>
              </div>
            )}
          </div>

          <div
            className={`w-[25%] ${settings?.heading === "" ? "opacity-50 pointer-events-none" : "opacity-100"} h-[680px] overflow-y-scroll  rounded-lg  p-4 bg-white`}
          >
            <div className="border-b flex items-center justify-between pb-2 mb-4">
              <p className="font-bold text-xl text-gray-800">Settings</p>
              <div className="flex gap-2">
                <Button
                  onClick={() => setSettings({ ...settings, heading: "" })}
                  variant="secondary"
                  tone="critical"
                >
                  Cancel
                </Button>
                {settings.heading !== "" && (
                  <Button variant="primary">Save</Button>
                )}
              </div>
            </div>

            <div className="mb-6">
              <label
                htmlFor="heading"
                className="block text-sm font-medium text-gray-700"
              >
                Edit Heading
              </label>
              <input
                type="text"
                id="heading"
                onClick={() => {
                  setIsSetModal(true);
                }}
                value={settings.heading}
                onChange={(e) =>
                  setSettings({ ...settings, heading: e.target.value })
                }
                placeholder="Enter product heading"
                className="mt-1 block w-full py-2 px-4 rounded-md border-gray-300 shadow-sm focus:outline-indigo-500   sm:text-sm"
              />
            </div>

            <div className="mb-6">
              <Button variant="primary">Select Product</Button>
            </div>
            <div className="pb-2">
              <p>Description</p>
              <textarea
                value={settings.description}
                onChange={(e) =>
                  setSettings({ ...settings, description: e.target.value })
                }
                rows={2}
                placeholder="Enter product description"
                className="mt-1 block w-full py-2 px-4 rounded-md border border-gray-400 shadow-sm focus:outline-blue-500   sm:text-sm"
              ></textarea>
            </div>
            <div className="flex flex-col gap-4">
              <p className="font-semibold">Position</p>

              <div className="flex flex-col gap-2">
                <p>Horizontal</p>
                <RangeSlider
                  output
                  label=""
                  min={0}
                  max={100}
                  value={mobileRangeValue}
                  onChange={handleMobileRangeSliderChange}
                  suffix={
                    <p className="min-w-20 rounded-md flex items-center justify-between text-right border-2 border-slate-500 py-2 px-4">
                      {mobileRangeValue}
                      <span>%</span>
                    </p>
                  }
                />
                <p className="font-light">
                  Horizontal position of the hot spot
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <p>Vertical</p>
                <RangeSlider
                  output
                  label=""
                  min={0}
                  max={100}
                  value={mobileVerticalRange}
                  onChange={handleMobileRangeVerticalSliderChange}
                  suffix={
                    <p className="min-w-20 rounded-md flex items-center justify-between text-right border-2 border-slate-500 py-2 px-4">
                      {mobileVerticalRange}
                      <span>%</span>
                    </p>
                  }
                />
                <p className="font-light">Vertical position of the hot spot</p>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <p className="font-semibold">Mobile Position</p>

              <div className="flex flex-col gap-2">
                <p>Horizontal</p>
                <RangeSlider
                  output
                  label=""
                  min={0}
                  max={100}
                  value={rangeValue}
                  onChange={handleRangeSliderChange}
                  suffix={
                    <p className="min-w-20 rounded-md flex items-center justify-between text-right border-2 border-slate-500 py-2 px-4">
                      {rangeValue}
                      <span>%</span>
                    </p>
                  }
                />
                <p className="font-light">
                  Horizontal position of the hot spot
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <p>Vertical</p>
                <RangeSlider
                  output
                  label=""
                  min={0}
                  max={100}
                  value={verticalRange}
                  onChange={handleVerticalRangeSliderChange}
                  suffix={
                    <p className="min-w-20 rounded-md flex items-center justify-between text-right border-2 border-slate-500 py-2 px-4">
                      {verticalRange}
                      <span>%</span>
                    </p>
                  }
                />
                <p className="font-light">Vertical position of the hot spot</p>
              </div>
            </div>
          </div>
        </div>
      </Page>
    </div>
  );
};

export default PageFlip;
