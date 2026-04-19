import { FooterData } from '../models/footer.model';

export const FOOTER_DATA: FooterData = {
  companyName: 'Grupo Innovar L&L',
  description: 'Impulsamos la innovación en tecnología y comercio electrónico, con soluciones de calidad para el hogar, la industria y el estilo de vida.',
  email: 'soporte@grupoinnovar.com',
  realEmail: 'grupoinnovarlyl@gmail.com',
  phone: '+57 3133668716',
  location: 'Colombia',

  linkGroups: [
    {
      title: 'Navegación',
      links: [
        { label: 'Inicio', url: '/' },
        { label: 'Productos', url: '/productos' },
      ]
    },
    {
      title: 'Mi Cuenta',
      links: [
        { label: 'Perfil', url: '/dashboard' },
        { label: 'Mis pedidos', url: '/orders' },
        { label: 'Carrito', url: '/cart' }
      ]
    },
    {
      title: 'Soporte',
      links: [
        { label: 'FAQ', url: '/faq' },
        { label: 'Contacto', url: '/contacto' },
        { label: 'Términos', url: '/terminos' },
        { label: 'Privacidad', url: '/privacidad' }
      ]
    }
  ]

};