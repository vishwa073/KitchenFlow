export const demoMenu = [
  {
    category: "Biryani",
    items: [
      {
        name: "Hyderabadi Chicken Biryani",
        description:
          "Aromatic basmati rice layered with flavorful chicken and traditional spices.",
        foodType: "NON_VEG" as const,
        spiceLevel: "MEDIUM" as const,
        prepTimeMin: 25,
        // Replaced the previous image URL.
        imageUrl:
          "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80",
        variants: [
          { name: "Regular", price: 249 },
          { name: "Large", price: 349 },
        ],
        addons: [
          { name: "Extra Chicken", price: 80 },
          { name: "Boiled Egg", price: 20 },
          { name: "Extra Raita", price: 25 },
          { name: "Extra Salan", price: 20 },
        ],
      },
      {
        name: "Paneer Biryani",
        description:
          "Fragrant basmati rice cooked with paneer and aromatic spices.",
        foodType: "VEG" as const,
        spiceLevel: "MEDIUM" as const,
        prepTimeMin: 20,
        imageUrl:
          "https://images.unsplash.com/photo-1633945274405-b6c8069047b0",
        variants: [
          { name: "Regular", price: 199 },
          { name: "Large", price: 279 },
        ],
        addons: [
          { name: "Extra Paneer", price: 60 },
          { name: "Extra Raita", price: 25 },
          { name: "Extra Salan", price: 20 },
        ],
      },
    ],
  },
  {
    category: "Starters",
    items: [
      {
        name: "Chicken 65",
        description:
          "Crispy, spicy chicken bites tossed with curry leaves.",
        foodType: "NON_VEG" as const,
        spiceLevel: "HOT" as const,
        prepTimeMin: 15,
        imageUrl:
          "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398",
        variants: [{ name: "Regular", price: 179 }],
        addons: [
          { name: "Extra Chicken 65", price: 70 },
          { name: "Mint Chutney", price: 20 },
        ],
      },
      {
        name: "Paneer Tikka",
        description:
          "Char-grilled paneer cubes marinated with Indian spices.",
        foodType: "VEG" as const,
        spiceLevel: "MEDIUM" as const,
        prepTimeMin: 15,
        imageUrl:
          "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8",
        variants: [{ name: "Regular", price: 169 }],
        addons: [
          { name: "Extra Paneer Tikka", price: 60 },
          { name: "Mint Chutney", price: 20 },
        ],
      },
    ],
  },
  {
    category: "Beverages",
    items: [
      {
        name: "Irani Chai",
        description:
          "Traditional Hyderabad-style tea with a rich, creamy flavor.",
        foodType: "VEG" as const,
        spiceLevel: "MILD" as const,
        prepTimeMin: 5,
        imageUrl:
          "https://images.unsplash.com/photo-1571934811356-5cc061b6821f",
        variants: [{ name: "Regular", price: 49 }],
        addons: [{ name: "Extra Chai", price: 15 }],
      },
    ],
  },
] as const;