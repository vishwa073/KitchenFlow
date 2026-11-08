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
        imageUrl:
          "https://images.unsplash.com/photo-1563379091339-03246963d96c",
        variants: [
          { name: "Regular", price: 249 },
          { name: "Large", price: 349 },
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
      },
    ],
  },
] as const;