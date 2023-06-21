import React, { useRef, useState, useEffect } from "react";
import Moveable from "react-moveable";

const App = () => {
  const [moveableComponents, setMoveableComponents] = useState([]);
  const [selected, setSelected] = useState(null);

  const addMoveable = () => {
    // Create a new moveable component and add it to the array
    const COLORS = ["red", "blue", "yellow", "green", "purple"];

    setMoveableComponents((prevMoveables) => [
      ...prevMoveables,
      {
        id: Math.floor(Math.random() * Date.now()),
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        updateEnd: true
      },
    ]);
  };

  const updateMoveable = (id, newComponent, updateEnd = false) => {
    setMoveableComponents((prevMoveables) => {
      return prevMoveables.map((moveable) => {
        if (moveable.id === id) {
          return { ...moveable, ...newComponent, updateEnd };
        }
        return moveable;
      });
    });
  };

  const handleResizeStart = (id, e) => {
    const handlePosX = e.direction[0];
    const handlePosY = e.direction[1];

    if (handlePosX === -1) {
      const moveable = moveableComponents.find(
        (moveable) => moveable.id === id
      );

      if (moveable) {
        const { left, width } = moveable;
        moveable.initialLeft = left;
        moveable.initialWidth = width;

        e.setOrigin(["%", "%"]);
        e.set([0, 0]);
      }
    }
  };

  const handleDeleteMoveable = (id) => {
    setMoveableComponents((prevMoveables) =>
      prevMoveables.filter((moveable) => moveable.id !== id)
    );
    setSelected((prevSelected) => (prevSelected === id ? null : prevSelected));
  };

  return (
    <main style={{ height: "100vh", width: "100vw" }}>
      <button onClick={addMoveable}>Add Moveable</button>
      <div
        id="parent"
        style={{
          position: "relative",
          background: "black",
          height: "80vh",
          width: "80vw",
        }}
      >
        {moveableComponents.map((item) => (
          <Component
            {...item}
            key={item.id}
            updateMoveable={updateMoveable}
            handleResizeStart={handleResizeStart}
            handleDeleteMoveable={handleDeleteMoveable}
            setSelected={setSelected}
            isSelected={selected === item.id}
          />
        ))}
      </div>
    </main>
  );
};

export default App;

const Component = ({
  id,
  top,
  left,
  width,
  height,
  color,
  updateMoveable,
  handleResizeStart,
  handleDeleteMoveable,
  setSelected,
  isSelected = false,
  updateEnd,
}) => {
  const ref = useRef();
  const [image, setImage] = useState(null);

  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/photos")
      .then((response) => response.json())
      .then((data) => {
        const randomIndex = Math.floor(Math.random() * data.length);
        const imageUrl = data[randomIndex]?.url || "";
        setImage(imageUrl);
      });
  }, []);

  const onResize = (e) => {
    const newWidth = e.width;
    const newHeight = e.height;

    const parent = document.getElementById("parent");
    const parentBounds = parent?.getBoundingClientRect();

    let updatedWidth = newWidth;
    let updatedHeight = newHeight;

    if (left + newWidth > parentBounds?.width) {
      updatedWidth = parentBounds?.width - left;
    }
    if (top + newHeight > parentBounds?.height) {
      updatedHeight = parentBounds?.height - top;
    }

    updateMoveable(id, {
      top,
      left,
      width: updatedWidth,
      height: updatedHeight,
      color,
    });

    const beforeTranslate = e.drag.beforeTranslate;
    const translateX = beforeTranslate[0];
    const translateY = beforeTranslate[1];

    ref.current.style.width = `${newWidth}px`;
    ref.current.style.height = `${newHeight}px`;
    ref.current.style.transform = `translate(${translateX}px, ${translateY}px)`;
  };

  const onResizeEnd = (e) => {
    const newWidth = e.width;
    const newHeight = e.height;

    const parent = document.getElementById("parent");
    const parentBounds = parent?.getBoundingClientRect();

    let updatedWidth = newWidth;
    let updatedHeight = newHeight;

    if (left + newWidth > parentBounds?.width) {
      updatedWidth = parentBounds?.width - left;
    }
    if (top + newHeight > parentBounds?.height) {
      updatedHeight = parentBounds?.height - top;
    }

    const beforeTranslate = e.drag.beforeTranslate;
    const absoluteTop = top + beforeTranslate[1];
    const absoluteLeft = left + beforeTranslate[0];
    
    updateMoveable(
      id,
      {
        top: absoluteTop,
        left: absoluteLeft,
        width: updatedWidth,
        height: updatedHeight,
        color,
      },
      true
    );
  };

  const onDelete = () => {
    handleDeleteMoveable(id); // Llama a la función handleDeleteMoveable cuando se hace clic en el botón de eliminación
  };
  

  return (
    <>
     <button onClick={onDelete}>Delete</button>
    <div
      ref={ref}
      className={`draggable ${isSelected ? "selected" : ""}`}
      id={"component-" + id}
      style={{
        position: "absolute",
        top: top,
        left: left,
        width: width,
        height: height,
        background: color,
        backgroundImage: `url(${image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      onClick={() => setSelected(id)}
    />

    <Moveable
      target={isSelected && ref.current}
      resizable
      draggable
      onDrag={(e) => {
        // Restringir las coordenadas de posición al div "parent"
        const parent = document.getElementById("parent");
        const parentBounds = parent?.getBoundingClientRect();

        let newTop = e.top;
        let newLeft = e.left;

        if (e.top < 0) {
          newTop = 0;
        } else if (e.top + height > parentBounds?.height) {
          newTop = parentBounds?.height - height;
        }

        if (e.left < 0) {
          newLeft = 0;
        } else if (e.left + width > parentBounds?.width) {
          newLeft = parentBounds?.width - width;
        }

        updateMoveable(id, {
          top: newTop,
          left: newLeft,
          width,
          height,
          color,
        });
      }}
        onResizeStart={(e) => handleResizeStart(id, e)}
        onResize={onResize}
        onResizeEnd={onResizeEnd}
        keepRatio={false}
        throttleResize={1}
        renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
        edge={false}
        zoom={1}
        origin={false}
        padding={{ left: 0, top: 0, right: 0, bottom: 0 }} />
    </>
  );
};
