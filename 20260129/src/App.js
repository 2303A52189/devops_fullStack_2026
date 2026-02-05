import React, { useState } from "react";
import ProductCard from "./components/ProductCard";

function App() {
  // STATE
  const [cartCount, setCartCount] = useState(0);

  // Product data
  const products = [
    { id: 1, name: "Mobile", price: 15000 },
    { id: 2, name: "Laptop", price: 55000 },
    { id: 3, name: "Headphones", price: 2000 }
  ];

  // Function to update state
  const addToCart = () => {
    setCartCount(cartCount + 1);
  };

  return (
    <div className="container">
      <h1>Online Shopping Website</h1>
      <h2>Cart Items: {cartCount}</h2>

      {/* Passing data to child using props */}
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          addToCart={addToCart}
        />
      ))}
    </div>
  );
}

export default App;
