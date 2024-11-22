import { useState, MouseEvent, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Draggable from "react-draggable";
import { useFetcher } from "@remix-run/react";
import { IMAGES, Marker } from "app/constants/types";
import {
  Button,
  Card,
  Layout,
  LegacyCard,
  MediaCard,
  Page,
  Pagination,
  RangeSlider,
} from "@shopify/polaris";
import { useSelector } from "react-redux";
import { Modal, TitleBar, useAppBridge } from "@shopify/app-bridge-react";

const PageFlip = ({ images, metaFieldId, pdfName }: IMAGES) => {
  const shopify = useAppBridge();
  const fetcher = useFetcher();
  const plan = useSelector((state: any) => state.plan.plan);
  console.log(plan, "PLANNING");

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

  console.log(markers);
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
    horizonalValue: 10,
    verticalValue: 10,
    mobileHorizontalRange: 0,
    mobileVerticalRange: 0,
  });
  const [isShowModal, setIsSetModal] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleImageMarker = async (
    event: MouseEvent<HTMLImageElement>,
    imageIndex: number,
  ) => {
    if (!containerRef.current) return;

    let maxMarkers = 0;
    if (plan === "Free") {
      maxMarkers = 3;
    } else if (plan === "Basic") {
      maxMarkers = 3;
    } else if (plan === "Advanced") {
      maxMarkers = Infinity;
    }

    const currentMarkersForPage = markers.filter(
      (marker) => marker.imageIndex === imageIndex,
    );
    const totalMarkers = markers.length;

    if (plan === "Free" && totalMarkers >= maxMarkers) {
      shopify.toast.show(
        "You have reached the maximum marker limit for your plan.",
      );
      return;
    }

    if (plan === "Basic" && currentMarkersForPage.length >= maxMarkers) {
      shopify.toast.show("You can only add 3 markers per page for your plan.");
      return;
    }
    const rect = containerRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    console.log(x);
    console.log(y);

    const imageWidth = rect.width;
    const imageHeight = rect.height;

    const xPercentage = (x / imageWidth) * 100;
    const yPercentage = (y / imageHeight) * 100;
    console.log(xPercentage, "x%");
    console.log(yPercentage, "y%");
    const selected: any = await shopify.resourcePicker({
      type: "product",
      multiple: 1,
      filter: { variants: false, archived: false, draft: false },
    });

    if (selected && selected.length > 0) {
      setMarkers((prevMarkers) => [
        ...prevMarkers,
        {
          x: x,
          y: y,
          imageIndex,
          handle: selected[0].handle,
          product: selected[0].title,
          productId: selected[0].id,
          productImage: selected[0]?.images[0]?.originalSrc,
          color: colorPalette[prevMarkers.length % colorPalette.length],
          xPercentage,
          yPercentage,
        },
      ]);
    }
  };

  console.log(markers, "MARKERS");

  const handleMarkerClick = (marker: Marker) => {
    setSelectedMarker(marker);
    setIsSetModal(true);
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

  const handleRangeSliderChange = useCallback(
    (value: number) =>
      setSettings({
        ...settings,
        horizonalValue: value,
      }),
    [],
  );
  const handleVerticalRangeSliderChange = useCallback(
    (value: number) =>
      setSettings({
        ...settings,
        verticalValue: value,
      }),
    [],
  );

  const handleMobileRangeSliderChange = useCallback(
    (value: number) =>
      setSettings({
        ...settings,
        mobileHorizontalRange: value,
      }),
    [],
  );
  const handleMobileRangeVerticalSliderChange = useCallback(
    (value: number) =>
      setSettings({
        ...settings,
        mobileVerticalRange: value,
      }),
    [],
  );

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
        <Layout >
          <Card background="bg-surface-secondary">
            <div
              ref={containerRef}
              // h-[80vh] w-full
              className="relative p-8  w-full mx-auto"
              id="image-container"
            >
              <motion.div
                className=" flex w-full  bg-white rounded-lg shadow-lg"
                initial={{ rotateY: 0, zIndex: 0 }}
                animate={{
                  rotateY: animate ? (currentPage % 2 === 0 ? 0 : -180) : 0,
                  zIndex: currentPage % 2 === 0 ? 0 : 1,
                }}
                transition={{ duration: 0.6 }}
                style={{ transformOrigin: "right center" }}
                onAnimationComplete={() => setAnimate(false)}
              >
                {/* Make a parent div relative ref  */}
                <div  >
                <img
                  src={images[currentPage].url}
                  alt={`Page ${currentPage + 1}`}
                  className="w-full cursor-crosshair h-full object-contain rounded-tl-lg rounded-bl-lg"
                  onClick={(event) => handleImageMarker(event, currentPage)}
                />
                </div>

<div>

                <img
                  src={
                    currentPage + 1 < images.length
                      ? images[currentPage + 1].url
                      : images[currentPage].url
                  }
                  alt={`Page ${currentPage + 2}`}
                  className="w-full h-full cursor-crosshair object-contain rounded-tr-lg rounded-br-lg"
                  onClick={(event) => handleImageMarker(event, currentPage + 1)}
                />
</div>


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
                          {
                            handleMarkerClick(marker)
                            setSettings({
                              ...settings,
                              verticalValue: marker.x,
                              horizonalValue: marker.y,
                              heading: marker.product,
                            })
                          }
                        }

                          // onDoubleClick={() => handleMarkerClick(marker)}
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

            <button onClick={() => shopify.modal.show('my-modal')}>Open Modal</button>
      <Modal id="my-modal">
        
        <TitleBar title="Title">
          
          
          <button variant="primary">Label</button>
          <button onClick={() => shopify.modal.hide('my-modal')}>Label</button>
        </TitleBar>
      </Modal>
      
            <div className="flex items-center justify-center w-full mt-2">
              <Pagination
                label="Pagination"
                hasPrevious={currentPage !== 0}
                onPrevious={handlePrevPage}
                hasNext={currentPage + 2 < images.length}
                onNext={handleNextPage}
              />
            </div>
            {selectedMarker && (
              <div className="w-full border-2 absolute  bg-gray-700 h-screen">

              <div className=" absolute top-20  left-2 w-[40%]">
  
                  <MediaCard
                    title="Getting Started"
                    primaryAction={{
                      content: 'Learn about getting started',
                      onAction: () => {},
                    }}
                    description="Discover how Shopify can power up your entrepreneurial journey."
                    popoverActions={[{content: 'Dismiss', onAction: () => {}}]}
                  >
                    <img
                      alt=""
                      width="100%"
                      height="100%"
                      style={{
                        objectFit: 'cover',
                        objectPosition: 'center',
                      }}
                      src="https://burst.shopifycdn.com/photos/business-woman-smiling-in-office.jpg?width=1850"
                    />
                  </MediaCard>
                  </div>
              </div>


            )}
          </Card>

          {/* <div
            className={`w-[25%] ${settings?.heading === "" ? "opacity-50 pointer-events-none" : "opacity-100"} h-[680px] overflow-y-scroll  rounded-lg  p-4 bg-white`}
          >
            <div className="border-b flex items-center justify-between pb-2 mb-4">
              <p className="font-bold text-xl text-gray-800">Settings</p>
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
              <p className="font-semibold">Mobile Position</p>

              <div className="flex flex-col gap-2">
                <p>Horizontal</p>
                <RangeSlider
                  output
                  label=""
                  min={0}
                  max={100}
                  value={settings.horizonalValue}
                  onChange={handleRangeSliderChange}
                  suffix={
                    <p className="min-w-20 rounded-md flex items-center justify-between text-right border-2 border-slate-500 py-2 px-4">
                      {settings.horizonalValue}
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
                  value={settings.verticalValue}
                  onChange={handleVerticalRangeSliderChange}
                  suffix={
                    <p className="min-w-20 rounded-md flex items-center justify-between text-right border-2 border-slate-500 py-2 px-4">
                      {settings.verticalValue}
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
                  value={settings.mobileHorizontalRange}
                  onChange={handleMobileRangeSliderChange}
                  suffix={
                    <p className="min-w-20 rounded-md flex items-center justify-between text-right border-2 border-slate-500 py-2 px-4">
                      {settings.mobileHorizontalRange}
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
                  value={settings.mobileVerticalRange}
                  onChange={handleMobileRangeVerticalSliderChange}
                  suffix={
                    <p className="min-w-20 rounded-md flex items-center justify-between text-right border-2 border-slate-500 py-2 px-4">
                      {settings.mobileVerticalRange}
                      <span>%</span>
                    </p>
                  }
                />
                <p className="font-light">Vertical position of the hot spot</p>
              </div>
            </div>
          </div> */}
        </Layout>
      </Page>
    </div>
  );
};

export default PageFlip;
