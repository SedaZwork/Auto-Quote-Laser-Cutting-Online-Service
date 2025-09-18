// Update this page (the content is just a fallback if you fail to update the page)

import { MadeWithDyad } from "@/components/made-with-dyad";
import LaserCuttingService from "@/components/LaserCuttingService";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Precision Laser Cutting Service</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload your design files and get an instant quote for professional laser cutting services
          </p>
        </div>
        
        <LaserCuttingService />
        
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-primary text-3xl font-bold mb-2">1</div>
              <h3 className="font-semibold mb-2">Upload Design</h3>
              <p className="text-gray-600 text-sm">
                Upload your DWG, DXF, or SVG files for laser cutting
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-primary text-3xl font-bold mb-2">2</div>
              <h3 className="font-semibold mb-2">Select Options</h3>
              <p className="text-gray-600 text-sm">
                Choose material, thickness, and delivery time
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-primary text-3xl font-bold mb-2">3</div>
              <h3 className="font-semibold mb-2">Get Quote</h3>
              <p className="text-gray-600 text-sm">
                Receive instant pricing and place your order
              </p>
            </div>
          </div>
        </div>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;