const flipBook = (elBook) => {
  let currentPage = 0;
  const pages = elBook.querySelectorAll(".page");
  const totalPages = pages.length;
  let points = [];

  const getPoints = (pageElement) => {
    return pageElement ? pageElement.querySelectorAll(".points") : [];
  };

  const updatePage = (newPage) => {
    currentPage = Math.max(0, Math.min(newPage, totalPages - 1));
    elBook.style.setProperty("--c", currentPage);

    const leftPage =
      currentPage > 0
        ? pages[currentPage - 1].querySelector(".back,.tooltip")
        : null;
    const rightPage =
      currentPage < totalPages - 1
        ? pages[currentPage + 1].querySelector(".front,.tooltip")
        : null;

    console.log(leftPage, "LEFT");
    const leftPoints = getPoints(leftPage);
    const rightPoints = getPoints(rightPage);

    points = [];
    if (leftPoints.length > 0) {
      console.log("Points found on left page:");
      leftPoints.forEach((point, index) => {
        points.push(point);
      });
    } else {
      console.log("No points found on left page.");
    }

    if (rightPoints.length > 0) {
      rightPoints.forEach((point, index) => {
        points.push(point);
      });
    } else {
      console.log("No points found on right page.");
    }

    points.forEach((point) => {
      point.addEventListener("click", (event) => {
        if (document.querySelector("div[data-hotspot-id]:not(.hidden)"))
          document
            .querySelector("div[data-hotspot-id]:not(.hidden)")
            .classList.toggle("hidden");

        const hotspotId = event.target
          .closest(".points")
          ?.getAttribute("data-id");
        if (!hotspotId) {
          console.error("No data-id found for the clicked point");
          return;
        }

        const targetPopover = document.querySelector(
          `div[data-hotspot-id="${hotspotId}"]`,
        );
        if (targetPopover) {
          targetPopover.classList.toggle("hidden");
        } else {
          console.error(`No popover found for data-hotspot-id: ${hotspotId}`);
        }
        let variantId;
        const submitButton = targetPopover.querySelector("button");
        const selectedVariant = targetPopover.querySelector("select");
        console.log(selectedVariant, "FUcking selected variant");

        if (selectedVariant) {
          selectedVariant.addEventListener("change", (e) => {
            variantId = e.target.value;
          });
        } else {
          variantId = targetPopover.querySelector("input[name='id']").value;
        }
        submitButton.addEventListener("click", (e) => {
          e.preventDefault();

          const formData = new FormData();
          formData.append("id", variantId);
          console.log(variantId, "VRIANLT");
          fetch("/cart/add.js", {
            method: "POST",
            body: formData,
          })
            .then((response) => response.json())
            .then((data) => {
              console.log("Product added to cart:", data);

              const hotspotId = event.target.closest(".points").dataset.id;
              const targetPopover = document.querySelector(
                `div[data-hotspot-id="${hotspotId}"]`,
              );
              if (targetPopover) {
                targetPopover.classList.add("hidden");
              }

              alert("Product added to your cart!");
            })
            .catch((error) => {
              console.error("Error adding product to cart:", error);
              alert(
                "There was an error adding the product to the cart. Please try again.",
              );
            });
        });
        console.log(targetPopover, "TARGET POPER");
      });
    });
  };

  pages.forEach((page, idx) => {
    page.style.setProperty("--i", idx);
  });

  console.log("Checked");
  const prevBtn = document.querySelector(".prev");
  const nextBtn = document.querySelector(".next");

  prevBtn.addEventListener("click", () => updatePage(currentPage - 1));
  nextBtn.addEventListener("click", () => updatePage(currentPage + 1));

  updatePage(0);
};

document.querySelectorAll(".book").forEach(flipBook);
