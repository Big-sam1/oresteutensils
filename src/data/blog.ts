import { images } from './products';

export interface BlogPostItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  tag: string;
  date: string;
  readTime: string;
  image: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  intro: string;
  sections: {
    heading: string;
    body: string[];
    tip?: string;
  }[];
  conclusion: string;
}

export const blogPosts: BlogPostItem[] = [
  {
    id: 'b2',
    slug: 'packing-light-the-24-hour-carry-on-method',
    title: 'Packing light: the 24-hour carry-on method',
    excerpt:
      'A repeatable way to fit a weekend into one bag, tested on six trips this summer.',
    tag: 'Travel',
    date: 'Aug 11, 2026',
    readTime: '4 min read',
    image: images.backpack,
    author: {
      name: 'Elena Vance',
      role: 'Travel Editor & Product Lead',
      avatar: 'https://i.pravatar.cc/128?img=45',
    },
    intro:
      'Over the course of six weekend trips this summer across diverse climates, we refined a modular packing system that fits everything you need into a single 28L carry-on without sacrificing style, functionality, or comfort.',
    sections: [
      {
        heading: '1. The Core 3-2-1 Rule',
        body: [
          'The biggest mistake weekend travelers make is packing for hypothetical scenarios. Instead, build your kit around the 3-2-1 foundation: 3 tops made from breathable organic cotton or merino wool, 2 bottoms (one versatile chino and one tailored short/trouser), and 1 lightweight layering jacket.',
          'Choose a neutral color palette—olive, stone, black, and navy—so every top matches every bottom seamlessly.',
        ],
        tip: 'Roll garments instead of folding them to prevent creases and maximize compression inside storage cubes.',
      },
      {
        heading: '2. Dedicated Gear & Tech Organization',
        body: [
          'Keep your cords, chargers, and compact essentials in an organized tech pouch rather than scattered loose. Use multi-port GaN wall chargers so a single brick powers your phone, tablet, and smartwatch simultaneously.',
          'For liquids and toiletries, decant favorites into leak-proof 50ml silicone bottles packed into a clear water-resistant pouch for swift airport transit.',
        ],
      },
      {
        heading: '3. Footwear & Heavy Layer Strategy',
        body: [
          'Always wear your heaviest shoes and your outer jacket during transit. Pack only one secondary pair of versatile sneakers or loafers that lay flat in the bottom shoe compartment of your bag.',
          'This single adjustment frees up more than 35% of interior carry-on volume for clothing and daily essentials.',
        ],
        tip: 'Stuff rolled socks inside your packed shoes to preserve their shape and utilize dead space.',
      },
    ],
    conclusion:
      'Mastering the 24-hour carry-on method removes the stress of baggage claims and overstuffed suitcases. Travel light, move fast, and focus entirely on the journey ahead.',
  },
  {
    id: 'b1',
    slug: 'how-we-test-kitchen-cookware-and-cutlery',
    title: 'How we test cookware and cutlery before they hit the shelf',
    excerpt:
      'Our culinary team runs every chef knife and sauté pan through rigorous thermal and edge-retention trials.',
    tag: 'Buying Guides',
    date: 'Aug 18, 2026',
    readTime: '5 min read',
    image: images.hero,
    author: {
      name: 'Chef Marcus K.',
      role: 'Master Chef & Culinary Director',
      avatar: 'https://i.pravatar.cc/128?img=12',
    },
    intro:
      'Before any frying pan or chef knife earns a place in the Oresteutensils catalog, it undergoes rigorous torture testing in professional kitchen conditions to ensure lasting durability, heat distribution, and effortless ergonomics.',
    sections: [
      {
        heading: '1. Thermal Imaging & Heat Distribution',
        body: [
          'We use FLIR thermal imaging cameras to inspect cookware bases across gas, electric, and induction cooktops. High-grade cookware must distribute heat evenly to the rim within 90 seconds without hot spots.',
          'Tri-ply stainless steel and reinforced ceramic non-stick coatings are tested for thermal shock resistance by cycling between 200°C heat and icy water baths.',
        ],
      },
      {
        heading: '2. Rockwell Hardness & Edge Retention',
        body: [
          'Our high-carbon German steel knives are measured on the Rockwell Hardness Scale (56–58 HRC) to balance razor-sharp 15° cutting precision with ease of daily honing.',
          'Each blade slices through 500 dense roots and fibrous vegetables to test retention before receiving quality approval.',
        ],
      },
    ],
    conclusion:
      'By pairing rigorous engineering standards with real culinary testing, every piece in your kitchen is built to perform for decades.',
  },
  {
    id: 'b3',
    slug: 'essential-cookware-pieces-every-kitchen-needs',
    title: 'The five essential cookware pieces every home chef needs',
    excerpt:
      'Fewer, better kitchen tools that handle 95% of daily recipes with ease and elegance.',
    tag: 'Kitchen',
    date: 'Aug 04, 2026',
    readTime: '3 min read',
    image: images.cookware,
    author: {
      name: 'Sarah M.',
      role: 'Pastry Chef & Recipe Developer',
      avatar: 'https://i.pravatar.cc/128?img=33',
    },
    intro:
      'You do not need a cluttered cabinet filled with specialized gadgets. A focused collection of high-quality essentials is all that is needed to create restaurant-quality meals every night.',
    sections: [
      {
        heading: '1. The 10-inch Non-Stick Frying Pan',
        body: [
          'From delicate French omelets to seared salmon fillets, a multi-layer ceramic non-stick pan is the undisputed daily workhorse of every modern kitchen.',
        ],
      },
      {
        heading: '2. The 8-inch Chef Knife & Sauté Pan',
        body: [
          'Paired with a versatile stainless steel sauté pan that transitions from stovetop to oven, your meal preparation becomes effortless and consistent.',
        ],
      },
    ],
    conclusion:
      'Invest in quality, care for your tools, and let exceptional presentation elevate every taste.',
  },
];

export function getBlogPost(slug: string): BlogPostItem | undefined {
  return blogPosts.find((p) => p.slug === slug || p.id === slug);
}
