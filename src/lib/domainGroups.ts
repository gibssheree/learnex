export interface DomainGroup {
  title: string;
  domains: string[];
}

/** Mirrors the grouping used in the vault's own hub note, so the site's nav
 * matches the mental model the notes were already organized under. */
export const DOMAIN_GROUPS: DomainGroup[] = [
  {
    title: 'Core CS Fundamentals',
    domains: [
      'Data Structures and Algorithms',
      'Operating Systems',
      'Computer Networks',
      'Computer Architecture',
      'Theory of Computation',
      'Discrete Mathematics',
    ],
  },
  {
    title: 'Software Engineering & Applied Systems',
    domains: [
      'System Design and Distributed Systems',
      'Cybersecurity',
      'Software Engineering Practices',
      'Advanced Databases',
      'Cloud and Infrastructure',
      'Compilers',
      'Cloud Platforms',
      'Business and SaaS Platforms',
      'Data Engineering',
      'Legal and Compliance for Tech',
    ],
  },
  {
    title: 'Toolchain & Delivery',
    domains: ['DevOps Toolchain', 'Testing Tools and Frameworks'],
  },
  {
    title: 'Product, Design & Emerging Fields',
    domains: [
      'Blockchain and Web3',
      'Design and UX-UI',
      'Product Management',
      'Game Development',
      'IoT and Embedded Systems',
      'Quantum Computing',
    ],
  },
  {
    title: 'Specialized Domains',
    domains: ['Full-Stack', 'Artificial Intelligence', 'Machine Learning and Deep Learning', 'Git'],
  },
];

export const LANGUAGE_CATEGORY_ORDER = [
  'Systems',
  'OOP/Enterprise',
  'Scripting/Dynamic',
  'Functional',
  'Data/Scientific',
  'Legacy/Enterprise',
  'Niche',
];

export const LANGUAGE_CATEGORY_LABELS: Record<string, string> = {
  Systems: 'Systems / Compiled',
  'OOP/Enterprise': 'OOP / Enterprise',
  'Scripting/Dynamic': 'Scripting / Dynamic',
  Functional: 'Functional',
  'Data/Scientific': 'Data / Scientific',
  'Legacy/Enterprise': 'Legacy / Enterprise',
  Niche: 'Niche',
};
