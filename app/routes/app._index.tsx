import { useNavigate } from "@remix-run/react";

const Index = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-6 md:px-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Catalog to Cart - Shoppable PDF
          </h1>
          <p className="mt-4 text-lg md:text-xl">
            Transform your PDF catalogs into interactive, shoppable experiences.
            Engage your customers like never before!
          </p>
          <button
            onClick={() => navigate("/app/pdf-convert")}
            className="mt-6 px-6 py-3 bg-white text-blue-600 font-semibold rounded shadow hover:bg-gray-200 transition"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Why Use Shoppable PDFs?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white shadow rounded-lg text-center">
              {/* <img
                src="/interactive-icon.svg"
                alt="Interactive"
                className="w-16 mx-auto mb-4"
              /> */}
              <h3 className="text-xl font-semibold text-gray-700">
                Interactive Design
              </h3>
              <p className="text-gray-600 mt-2">
                Add clickable hotspots to your PDFs to make products shoppable
                directly from your catalog.
              </p>
            </div>
            <div className="p-6 bg-white shadow rounded-lg text-center">
              {/* <img
                src="/engagement-icon.svg"
                alt="Engagement"
                className="w-16 mx-auto mb-4"
              /> */}
              <h3 className="text-xl font-semibold text-gray-700">
                Boost Engagement
              </h3>
              <p className="text-gray-600 mt-2">
                Enhance customer interaction and streamline their shopping
                experience.
              </p>
            </div>
            <div className="p-6 bg-white shadow rounded-lg text-center">
              {/* <img
                src="/conversion-icon.svg"
                alt="Conversions"
                className="w-16 mx-auto mb-4"
              /> */}
              <h3 className="text-xl font-semibold text-gray-700">
                Drive Conversions
              </h3>
              <p className="text-gray-600 mt-2">
                Seamlessly turn browsing into buying by linking products to your
                store.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Showcase Section */}
      <section className="bg-gray-100 py-16">
        <div className="container mx-auto px-6 md:px-12 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              {/* <img
                src="/upload.png"
                alt="Upload PDF"
                className="w-3/4 mx-auto mb-4"
              /> */}
              <h3 className="text-xl font-semibold text-gray-700">
                Upload Your PDF
              </h3>
              <p className="text-gray-600">
                Start by uploading your PDF catalog.
              </p>
            </div>
            <div>
              {/* <img
                src="/convert.png"
                alt="Convert to Images"
                className="w-3/4 mx-auto mb-4"
              /> */}
              <h3 className="text-xl font-semibold text-gray-700">
                Add Hotspots
              </h3>
              <p className="text-gray-600">
                Highlight products with clickable points.
              </p>
            </div>
            <div>
              {/* <img
                src="/shoppable.png"
                alt="Shoppable PDF"
                className="w-3/4 mx-auto mb-4"
              /> */}
              <h3 className="text-xl font-semibold text-gray-700">
                Make It Shoppable
              </h3>
              <p className="text-gray-600">
                Share your PDF and let customers shop seamlessly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-6 md:px-12 text-center">
          <h2 className="text-3xl font-bold">
            Ready to Transform Your PDFs into Shoppable Catalogs?
          </h2>
          <p className="mt-4">
            Join thousands of businesses enhancing their customer experience.
          </p>
          <button
            onClick={() => navigate("/app/pdf-convert")}
            className="mt-6 px-6 py-3 bg-white text-blue-600 font-semibold rounded shadow hover:bg-gray-200 transition"
          >
            Try It Now
          </button>
        </div>
      </section>
    </div>
  );
};

export default Index;
