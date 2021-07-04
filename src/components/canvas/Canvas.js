import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Circle, Image, Line } from "react-konva";

import "./Canvas.css";
import CanvasControl from "./CanvasControl";

const Canvas = ({ images, markers, setMarker }) => {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const canvasContainer = useRef(null);
  const [currentImage, setCurrentImage] = useState(0);

  const img = images[currentImage];
  let scale, width, offsetX, offsetY, height;

  if (img) {
    const scaleWidth = size.width / img.width;
    const scaleHeight = size.height / img.height;
    scale = scaleWidth < scaleHeight ? scaleWidth : scaleHeight;
    width = img.width * scale;
    offsetX = (size.width - width) / 2;
    height = img.height * scale;
    offsetY = (size.height - height) / 2;
  }

  // Create hook only once on first render
  useEffect(() => {
    // Set initial size of canvas
    const { clientWidth, clientHeight } = canvasContainer.current;
    const newSize = { width: clientWidth, height: clientHeight };
    setSize(newSize);

    // Resize canvas to new size on every rezise event
    const handleResize = () => {
      const { clientWidth, clientHeight } = canvasContainer.current;
      const newSize = {
        width: clientWidth,
        height: clientHeight,
      };
      setSize(newSize);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const onNextImageIndex = (index) => setCurrentImage(index);

  const renderImage = (index) => {
    if (images[index]) {
      const img = images[index];
      return (
        <Image
          x={0 + offsetX}
          y={0 + offsetY}
          width={width}
          height={height}
          image={img}
        ></Image>
      );
    }
  };

  const renderMarkers = (index, radius, color, draggable) => {
    if (images[index]) {
      const img = images[index];
      if (markers[img.name]) {
        const currentMarkers = markers[img.name];
        return currentMarkers.map(({ id, x, y }) => {
          return (
            <Circle
              x={x * scale + offsetX}
              y={y * scale + offsetY}
              radius={radius * scale}
              fill={color}
              draggable={draggable}
              onDragEnd={(e) =>
                setMarker(
                  img.name,
                  id,
                  e.target.x() / scale - offsetX,
                  e.target.y() / scale - offsetY
                )
              }
            ></Circle>
          );
        });
      }
    }
  };

  const renderMarkerHistory = (index, size, radius, color) => {
    const indices = [];
    for (let cnt = index - size; cnt < index; cnt++) indices.push(cnt);
    return indices.map((idx) => {
      return renderMarkers(idx, radius, color);
    });
  };

  const renderMarkerFuture = (index, size, radius, color) => {
    const indices = [];
    for (let cnt = index + 1; cnt < index + size + 1; cnt++) indices.push(cnt);
    return indices.map((idx) => {
      return renderMarkers(idx, radius, color);
    });
  };

  return (
    <div className="canvas">
      <div ref={canvasContainer} className="canvas-container">
        <Stage className="canvas" width={size.width} height={size.height}>
          <Layer>
            {renderImage(currentImage)}
            {renderMarkers(currentImage, 10, "red", true)}
            {renderMarkerHistory(currentImage, 10, 4, "green", false)}
            {renderMarkerFuture(currentImage, 10, 4, "blue", false)}
          </Layer>
        </Stage>
      </div>
      <div>
        <CanvasControl
          onNextImageIndex={onNextImageIndex}
          imagesLength={images.length}
        ></CanvasControl>
      </div>
    </div>
  );
};

export default Canvas;
