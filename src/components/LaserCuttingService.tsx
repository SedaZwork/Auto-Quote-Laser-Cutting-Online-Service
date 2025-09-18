"use client";

import React, { useState, useRef } from 'react';
import { Upload, FileText, Eye, Package, Clock, DollarSign } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Material {
  id: string;
  name: string;
  pricePerSquareCm: number;
  thicknessOptions: number[];
}

interface DeliveryOption {
  id: string;
  name: string;
  days: number;
  priceMultiplier: number;
}

const LaserCuttingService = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [material, setMaterial] = useState<string>('');
  const [thickness, setThickness] = useState<number>(1);
  const [quantity, setQuantity] = useState<number>(1);
  const [delivery, setDelivery] = useState<string>('');
  const [price, setPrice] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Predefined materials and delivery options
  const materials: Material[] = [
    { id: 'acrylic', name: 'Acrylic', pricePerSquareCm: 0.15, thicknessOptions: [1, 2, 3, 5, 8, 10] },
    { id: 'wood', name: 'Wood', pricePerSquareCm: 0.12, thicknessOptions: [3, 5, 8, 10, 12, 15] },
    { id: 'metal', name: 'Metal', pricePerSquareCm: 0.25, thicknessOptions: [0.5, 1, 1.5, 2, 3] },
    { id: 'mdf', name: 'MDF', pricePerSquareCm: 0.10, thicknessOptions: [3, 5, 8, 10, 12] },
  ];

  const deliveryOptions: DeliveryOption[] = [
    { id: 'standard', name: 'Standard (5-7 days)', days: 7, priceMultiplier: 1.0 },
    { id: 'express', name: 'Express (2-3 days)', days: 3, priceMultiplier: 1.5 },
    { id: 'urgent', name: 'Urgent (24 hours)', days: 1, priceMultiplier: 2.5 },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    // Validate file type
    const validTypes = ['image/svg+xml', 'application/dxf', 'application/acad'];
    if (!validTypes.includes(uploadedFile.type) && 
        !uploadedFile.name.match(/\.(dxf|dwg|svg)$/i)) {
      toast.error('Invalid file type. Please upload DWG, DXF, or SVG files only.');
      return;
    }

    setFile(uploadedFile);
    
    // For SVG files, we can show a preview
    if (uploadedFile.type === 'image/svg+xml' || uploadedFile.name.match(/\.(svg)$/i)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(uploadedFile);
    } else {
      // For DWG/DXF files, show a placeholder
      setPreviewUrl(null);
    }
    
    // Simulate dimension extraction (in a real app, this would require server-side processing)
    setDimensions({ width: 10, height: 10 }); // Default dimensions
    toast.success('File uploaded successfully!');
  };

  const calculatePrice = () => {
    if (!material || !delivery || quantity <= 0) {
      toast.error('Please fill all required fields');
      return;
    }

    const selectedMaterial = materials.find(m => m.id === material);
    const selectedDelivery = deliveryOptions.find(d => d.id === delivery);
    
    if (!selectedMaterial || !selectedDelivery) return;

    const area = dimensions.width * dimensions.height;
    const basePrice = area * selectedMaterial.pricePerSquareCm * thickness;
    const totalPrice = basePrice * quantity * selectedDelivery.priceMultiplier;
    
    setPrice(parseFloat(totalPrice.toFixed(2)));
    toast.success('Price calculated successfully!');
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const resetForm = () => {
    setFile(null);
    setPreviewUrl(null);
    setDimensions({ width: 0, height: 0 });
    setMaterial('');
    setThickness(1);
    setQuantity(1);
    setDelivery('');
    setPrice(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-6 w-6" />
            Laser Cutting Service
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload Section */}
          <div className="space-y-4">
            <Label className="text-lg font-medium">Upload Design File</Label>
            <div 
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
              onClick={triggerFileInput}
            >
              <Input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".dxf,.dwg,.svg"
                className="hidden"
              />
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                <span className="font-medium text-primary">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                DXF, DWG, or SVG files only
              </p>
            </div>
            
            {file && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gray-500" />
                  <span className="text-sm font-medium">{file.name}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={resetForm}>
                  Remove
                </Button>
              </div>
            )}
          </div>

          {/* Preview Section */}
          {file && (
            <div className="space-y-4">
              <Label className="text-lg font-medium">Design Preview</Label>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 border rounded-lg p-4 flex items-center justify-center bg-gray-50 min-h-[200px]">
                  {previewUrl ? (
                    <img 
                      src={previewUrl} 
                      alt="Design preview" 
                      className="max-h-64 object-contain"
                    />
                  ) : (
                    <div className="text-center">
                      <Eye className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500">
                        Preview not available for this file type
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Dimensions: {dimensions.width}cm × {dimensions.height}cm
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <Label>Dimensions</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <Label className="text-xs">Width (cm)</Label>
                        <Input 
                          type="number" 
                          value={dimensions.width} 
                          onChange={(e) => setDimensions({...dimensions, width: parseFloat(e.target.value) || 0})}
                          min="0"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Height (cm)</Label>
                        <Input 
                          type="number" 
                          value={dimensions.height} 
                          onChange={(e) => setDimensions({...dimensions, height: parseFloat(e.target.value) || 0})}
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Quantity</Label>
                    <Input 
                      type="number" 
                      value={quantity} 
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      min="1"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Material Selection */}
          {file && (
            <div className="space-y-4">
              <Label className="text-lg font-medium">Material & Options</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Material</Label>
                  <Select value={material} onValueChange={setMaterial}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select material" />
                    </SelectTrigger>
                    <SelectContent>
                      {materials.map((mat) => (
                        <SelectItem key={mat.id} value={mat.id}>
                          {mat.name} (${mat.pricePerSquareCm.toFixed(2)}/cm²)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Thickness (mm)</Label>
                  <Select 
                    value={thickness.toString()} 
                    onValueChange={(value) => setThickness(parseFloat(value))}
                    disabled={!material}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select thickness" />
                    </SelectTrigger>
                    <SelectContent>
                      {material && materials.find(m => m.id === material)?.thicknessOptions.map((thick) => (
                        <SelectItem key={thick} value={thick.toString()}>
                          {thick} mm
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label>Delivery Time</Label>
                  <Select value={delivery} onValueChange={setDelivery}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select delivery option" />
                    </SelectTrigger>
                    <SelectContent>
                      {deliveryOptions.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.name} (×{option.priceMultiplier})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Price Calculation */}
          {file && material && delivery && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-primary/5 rounded-lg">
                <div>
                  <h3 className="font-medium">Estimated Price</h3>
                  <p className="text-sm text-gray-500">
                    Based on {dimensions.width}cm × {dimensions.height}cm, {quantity} piece(s)
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  {price !== null ? (
                    <div className="text-2xl font-bold text-primary">
                      ${price.toFixed(2)}
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-gray-400">
                      --
                    </div>
                  )}
                  <Button onClick={calculatePrice} className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Calculate
                  </Button>
                </div>
              </div>
              
              {price !== null && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button className="flex-1">Proceed to Order</Button>
                  <Button variant="outline" className="flex-1" onClick={resetForm}>
                    Start Over
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LaserCuttingService;