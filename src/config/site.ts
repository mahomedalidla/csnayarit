export const site = {
  name: 'Cámaras de Seguridad Nayarit',
  legalName: 'Cámaras de Seguridad Nayarit',
  tagline: 'Instalación profesional. Soporte que responde.',
  url: 'https://camarasdeseguridadnayarit.com',
  locale: 'es_MX',
  language: 'es-MX',
  telephone: '+523113001707',
  telephoneDisplay: '311 300 1707',
  email: 'ing@camarasdeseguridadnayarit.com',
  priceRange: '$$',
  foundingLocation: 'Tepic, Nayarit',
  image: '/assets/og.png',
  logo: '/assets/icon.png',
  sameAs: ['https://www.facebook.com/camarasdeseguridadnayarit'] as const,
  address: {
    addressLocality: 'Tepic',
    addressRegion: 'Nayarit',
    addressCountry: 'MX',
  },
  geo: {
    latitude: 21.5095,
    longitude: -104.8957,
  },
  openingHours: ['Mo-Sa 08:00-20:00'] as const,
  areaServed: ['Tepic', 'Xalisco', 'Compostela'] as const,
  whatsappPrefill:
    'Hola, quiero cotizar o reparar cámaras de seguridad en Nayarit.',
} as const;

export type NavItem = {
  href: string;
  label: string;
};

export const nav: NavItem[] = [
  { href: '/instalacion-camaras-seguridad-tepic', label: 'Instalación' },
  { href: '/mantenimiento-reparacion-dvr-cctv', label: 'Mantenimiento' },
  { href: '/redes-y-ampliacion-wifi', label: 'Redes Wi-Fi' },
  { href: '/cobertura', label: 'Cobertura' },
  { href: '/blog', label: 'Guías' },
];

export const services = [
  {
    name: 'Instalación de cámaras que no se caen',
    schemaName: 'Instalación de Cámaras Cableadas PoE / CCTV',
    href: '/instalacion-camaras-seguridad-tepic',
    summary:
      'Las ves en el celular, graban de noche y no dependen del Wi-Fi de la casa. Cable oculto, grabador en sitio y sin mensualidad de nube.',
  },
  {
    name: 'Ya no se ven en el celular: lo reparamos',
    schemaName: 'Mantenimiento y Rescate de DVR / NVR',
    href: '/mantenimiento-reparacion-dvr-cctv',
    summary:
      'Cambio de Telmex, Megacable o Totalplay, contraseña olvidada o el aparato que pita. Casi siempre se resuelve el mismo día, sin cambiar todo.',
  },
  {
    name: 'Guía: cámaras que se desconectaron al cambiar el módem',
    schemaName: 'Reconfiguración de Red por Cambio de Módem',
    href: '/blog/como-solucionar-camaras-desconfiguradas-cambio-modem',
    summary:
      'El internet nuevo “movió” la red y la app dejó de abrir las cámaras. Te explicamos por qué y vamos a reconectarlo.',
  },
  {
    name: 'Wi-Fi en toda la casa, sin zonas muertas',
    schemaName: 'Redes Wi-Fi y Ampliación de Cobertura',
    href: '/redes-y-ampliacion-wifi',
    summary:
      'Señal en patio, planta alta y bodega. Las cámaras van aparte para que no se te trabe Netflix ni el punto de venta.',
  },
] as const;

export const guides = [
  {
    href: '/blog/como-solucionar-camaras-desconfiguradas-cambio-modem',
    tag: 'Cambio de módem',
    title: 'Cómo volver a ver tus cámaras en el celular después de cambiar el módem',
    summary:
      'Cambiaste de Telmex, Megacable o Totalplay y la app se quedó en negro. Te explicamos por qué y vamos a reconectarlo.',
  },
  {
    href: '/blog/como-recuperar-contrasena-dvr-dahua-hikvision',
    tag: 'Contraseña',
    title: 'Se te olvidó la contraseña del grabador: qué sí y qué no hacer',
    summary:
      'La app pide administrador y nadie lo recuerda. No resetee a ciegas: te cotizamos el desbloqueo a domicilio.',
  },
  {
    href: '/blog/dvr-pita-deja-de-grabar-disco-duro',
    tag: 'Disco duro',
    title: 'El grabador pita o ya no guarda video: casi siempre es el disco',
    summary:
      'Pitido o días que faltan en la grabación. Diagnóstico a domicilio: te decimos si se cambia el disco, sin comprar un sistema nuevo.',
  },
  {
    href: '/blog/camaras-wifi-vs-cable-tepic',
    tag: 'Wi-Fi vs cable',
    title: 'Cámaras Wi-Fi o con cable en Tepic: cuál sí conviene',
    summary:
      'El kit Wi-Fi es más barato el primer día. Cotizamos cable en Tepic: el que no se cae al cambiar el módem.',
  },
] as const;

export const organizationId = `${site.url}/#organization`;

export function whatsappUrl(message = site.whatsappPrefill): string {
  const digits = site.telephone.replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function canonical(path = '/'): string {
  if (path === '/') return `${site.url}/`;
  return `${site.url}${path.startsWith('/') ? path : `/${path}`}`;
}

export type JsonLdNode = Record<string, unknown>;

export function organizationNode(): JsonLdNode {
  return {
    '@type': ['LocalBusiness', 'ProfessionalService'],
    '@id': organizationId,
    name: site.name,
    legalName: site.legalName,
    description:
      'Servicio a domicilio de instalación, mantenimiento y reparación de cámaras de seguridad en Tepic, Xalisco y Compostela, Nayarit. El técnico va a tu casa o negocio; no hay sucursal de mostrador.',
    url: site.url,
    image: canonical(site.image),
    logo: canonical(site.logo),
    telephone: site.telephone,
    email: site.email,
    priceRange: site.priceRange,
    currenciesAccepted: 'MXN',
    address: {
      '@type': 'PostalAddress',
      addressLocality: site.address.addressLocality,
      addressRegion: site.address.addressRegion,
      addressCountry: site.address.addressCountry,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: site.geo.latitude,
      longitude: site.geo.longitude,
    },
    areaServed: [
      { '@type': 'State', name: 'Nayarit' },
      ...site.areaServed.map((name) => ({
        '@type': 'City',
        name,
        containedInPlace: { '@type': 'State', name: 'Nayarit' },
      })),
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: site.telephone,
      contactType: 'customer service',
      areaServed: [...site.areaServed],
      availableLanguage: ['Spanish', 'es-MX'],
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '08:00',
      closes: '20:00',
    },
    sameAs: [...site.sameAs],
    knowsAbout: [
      'CCTV',
      'PoE',
      'Cat6',
      'DVR',
      'NVR',
      'DHCP',
      'P2P',
      'ciberseguridad',
      'Dahua',
      'Hikvision',
      'Epcom',
      'cableado estructurado',
    ],
  };
}

export function serviceCatalogNode(): JsonLdNode {
  return {
    '@type': 'Service',
    '@id': `${site.url}/#servicios`,
    name: 'Instalación y Mantenimiento de CCTV y Redes',
    provider: { '@id': organizationId },
    areaServed: { '@type': 'State', name: 'Nayarit' },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Servicios de Seguridad Electrónica',
      itemListElement: services.map((service) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: service.schemaName,
          url: canonical(service.href),
        },
      })),
    },
  };
}

export function websiteNode(): JsonLdNode {
  return {
    '@type': 'WebSite',
    '@id': `${site.url}/#website`,
    url: site.url,
    name: site.name,
    inLanguage: site.language,
    publisher: { '@id': organizationId },
  };
}

export function breadcrumbNode(
  crumbs: { name: string; path: string }[],
): JsonLdNode {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: canonical(crumb.path),
    })),
  };
}

export function articleNode(opts: {
  headline: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified?: string;
}): JsonLdNode {
  return {
    '@type': 'Article',
    headline: opts.headline,
    description: opts.description,
    inLanguage: site.language,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified ?? opts.datePublished,
    author: { '@id': organizationId },
    publisher: { '@id': organizationId },
    mainEntityOfPage: canonical(opts.path),
    image: canonical(site.image),
  };
}

export function faqNode(items: { question: string; answer: string }[]): JsonLdNode {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export const comparisonRows = [
  {
    aspect: 'La imagen',
    informal:
      'Cámaras Wi-Fi que se congelan, se desconectan o dejan de verse cuando hay visitas o el vecino pone su red.',
    standard:
      'Un cable lleva imagen y corriente (PoE Cat6). No usa el Wi-Fi de la casa, así que no se cae con la señal.',
  },
  {
    aspect: 'Cómo se ve tu casa',
    informal: 'Cables colgando, enchufes por todos lados y hoyos sin sellar.',
    standard:
      'Canaleta o tubería, cables peinados y perforaciones cerradas. Se nota el trabajo, no el desorden.',
  },
  {
    aspect: 'Dónde se guarda el video',
    informal: 'Una memoria MicroSD que un día deja de grabar y nadie se entera.',
    standard:
      'Disco duro en el grabador (DVR/NVR), grabando día y noche. Si falla, el aparato avisa.',
  },
  {
    aspect: 'Tu internet',
    informal: 'Al conectar las cámaras se pone lento el Wi-Fi de toda la familia.',
    standard:
      'Las cámaras van en su propia red. El celular, la tele y el punto de venta siguen igual de rápidos.',
  },
] as const;

export const homeFaqs = [
  {
    question: '¿Quién instala y repara cámaras de seguridad en Tepic y Xalisco?',
    answer:
      'Cámaras de Seguridad Nayarit instala, configura y repara sistemas de videovigilancia en Tepic, Xalisco y Compostela. Trabajamos casas, comercios y cotos: cámaras cableadas CCTV/PoE, grabadores DVR/NVR (Dahua, Hikvision, Epcom), la app en el celular sin mensualidad, y reseteo de contraseñas cuando el equipo se bloquea.',
  },
  {
    question: '¿Ponen cámaras Wi-Fi o con cable?',
    answer:
      'Para cuidar casa o negocio recomendamos cable. El Wi-Fi se satura, se desconfigura al cambiar el módem y cualquiera con un bloqueador barato puede tumbarlo. Con PoE Cat6 un solo cable lleva imagen y energía al grabador; ves las cámaras en el celular (P2P) sin pagar nube.',
  },
  {
    question: '¿Van a Xalisco y Compostela o solo a Tepic?',
    answer:
      'Sí. Atendemos Tepic y zona conurbada, Xalisco (Puerta del Sol, Centro, Fraccionamiento Canoas) y Compostela (Zona Centro y alrededores). No cobramos viáticos excesivos y la garantía va por escrito.',
  },
];
