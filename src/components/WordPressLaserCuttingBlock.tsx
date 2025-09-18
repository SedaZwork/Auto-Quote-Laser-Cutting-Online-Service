"use client";

import React from 'react';
import LaserCuttingService from './LaserCuttingService';

// This component can be used as a WordPress block
const WordPressLaserCuttingBlock = () => {
  return (
    <div className="wp-block-laser-cutting-service">
      <LaserCuttingService />
    </div>
  );
};

export default WordPressLaserCuttingBlock;