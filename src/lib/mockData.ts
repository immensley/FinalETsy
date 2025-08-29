export interface JobHistoryItem {
  id: string;
  date: string;
  title: string;
  thumbnail: string;
  seoScore: number;
  status: 'Completed' | 'Processing';
}

export const mockJobHistory: JobHistoryItem[] = [
  {
    id: '1',
    date: 'Jan 15, 2025',
    title: 'Personalized Moon Phase Necklace - Custom Sterling Silver Birthday Gift',
    thumbnail: 'https://images.pexels.com/photos/1454171/pexels-photo-1454171.jpeg?auto=compress&cs=tinysrgb&w=400',
    seoScore: 9.2,
    status: 'Completed'
  },
  {
    id: '2',
    date: 'Jan 14, 2025',
    title: 'Custom Pet Portrait - Personalized Dog Art Christmas Gift Commission',
    thumbnail: 'https://images.pexels.com/photos/1839919/pexels-photo-1839919.jpeg?auto=compress&cs=tinysrgb&w=400',
    seoScore: 8.7,
    status: 'Completed'
  },
  {
    id: '3',
    date: 'Jan 13, 2025',
    title: 'Personalized Macrame Wall Hanging - Custom Boho Home Decor Wedding Gift',
    thumbnail: 'https://images.pexels.com/photos/6510371/pexels-photo-6510371.jpeg?auto=compress&cs=tinysrgb&w=400',
    seoScore: 8.9,
    status: 'Completed'
  },
  {
    id: '4',
    date: 'Jan 12, 2025',
    title: 'Personalized Compass Necklace - Custom Brass Anniversary Gift Jewelry',
    thumbnail: 'https://images.pexels.com/photos/1454169/pexels-photo-1454169.jpeg?auto=compress&cs=tinysrgb&w=400',
    seoScore: 7.8,
    status: 'Processing'
  },
  {
    id: '5',
    date: 'Jan 11, 2025',
    title: 'Custom Wedding Invitations - Personalized Calligraphy Stationery Set',
    thumbnail: 'https://images.pexels.com/photos/1616470/pexels-photo-1616470.jpeg?auto=compress&cs=tinysrgb&w=400',
    seoScore: 9.1,
    status: 'Completed'
  }
];

export const generateMockListing = () => {
  const titleVariations = [
    'Sterling Silver Necklace - Personalized Moon Phase Birthday Gift',
    'Handmade Ring - Custom Sterling Silver Wedding Band',
    'Silver Moon Phase Pendant - Personalized Celestial Anniversary Gift',
    'Celestial Necklace - Custom Name Engraving Christmas Gift',
    'Moon Phase Jewelry - Handmade Silver Pendant Mother\'s Day Gift'
  ];

  const tags = [
    'sterling silver necklace', 'personalized moon jewelry', 'custom celestial gift', 'handmade silver pendant',
    'personalized name necklace', 'celestial birthday gift', 'custom anniversary jewelry', 'personalized wedding gift',
    'handmade celestial jewelry', 'moon phase pendant', 'custom silver jewelry', 'personalized christmas gift', 'custom mothers day gift'
  ];

  const description = `This stunning personalized moon phase necklace captures the mystical beauty of lunar cycles while celebrating your unique story. Each piece is carefully handcrafted by skilled artisans using premium .925 sterling silver, creating a timeless celestial accessory that makes the perfect custom gift.

KEY FEATURES & SPECIFICATIONS:
• Genuine .925 sterling silver construction
• Personalized moon phase design with detailed surface texture
• 18-inch adjustable chain (16-20 inches)
• Pendant diameter: 1.2 inches (30mm)
• 2000px+ high-resolution photos for mobile optimization
• Elegant gift packaging included

Perfect for astronomy lovers, moon enthusiasts, or anyone who appreciates unique handcrafted accessories. This personalized celestial jewelry piece makes an ideal custom gift for birthdays, anniversaries, weddings, Christmas, or Mother's Day. The custom lunar pendant catches light beautifully and adds an ethereal touch to any outfit.

CARE & MAINTENANCE: Clean with soft cloth and store in provided pouch to maintain shine. Avoid exposure to lotions, perfumes, and moisture for lasting beauty.

Each handmade necklace is personalized to order with meticulous attention to detail. Free gift wrapping included with every custom order. Ships within 3-5 business days.`;

  return {
    titles: titleVariations,
    tags,
    description,
    seoScore: 8.9 + Math.random() * 1.1
  };
};