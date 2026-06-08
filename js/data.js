const ITEMS = [
  { id: 1,  title: 'Zé Vaqueiro',        location: 'Praça da Bandeira',           capacity: '16 mil', date: '16/06/2026', dateFilter: '16 Jun', type: 'shows',        lat: -8.41819, lng: -37.05408 },
  { id: 2,  title: 'Solange Almeida',    location: 'Praça da Bandeira',           capacity: '12 mil', date: '16/06/2026', dateFilter: '16 Jun', type: 'shows',        lat: -8.41819, lng: -37.05408 },
  { id: 3,  title: 'Xand Avião',         location: 'Parque de Exposições',        capacity: '8 mil',  date: '17/06/2026', dateFilter: '17 Jun', type: 'shows',        lat: -8.42048, lng: -37.05598 },
  { id: 4,  title: 'Forró do Tico',      location: 'Centro Cultural',             capacity: '10 mil', date: '17/06/2026', dateFilter: '17 Jun', type: 'shows',        lat: -8.41908, lng: -37.05438 },
  { id: 5,  title: 'Wesley Safadão',     location: 'Praça da Bandeira',           capacity: '20 mil', date: '18/06/2026', dateFilter: '18 Jun', type: 'shows',        lat: -8.41819, lng: -37.05408 },
  { id: 6,  title: 'Mastruz com Leite',  location: 'Praça Mestre Dominguinhos',   capacity: '15 mil', date: '18/06/2026', dateFilter: '18 Jun', type: 'shows',        lat: -8.41708, lng: -37.05308 },
  { id: 7,  title: 'Barraca do Forró',   location: 'Praça da Bandeira',           capacity: '200',    date: '16-18/06/2026', dateFilter: 'Todos', type: 'restaurantes', lat: -8.41828, lng: -37.05428 },
  { id: 8,  title: 'Cantina da Festa',   location: 'Centro Cultural',             capacity: '150',    date: '16-18/06/2026', dateFilter: 'Todos', type: 'restaurantes', lat: -8.41918, lng: -37.05448 },
  { id: 9,  title: 'Cozinha do Arraial', location: 'Parque de Exposições',        capacity: '300',    date: '16-18/06/2026', dateFilter: 'Todos', type: 'restaurantes', lat: -8.42058, lng: -37.05618 },
];

const CAROUSEL_SLIDES = [
  { id: 1, title: 'Zé Vaqueiro',       sub: '16 Jun  •  Praça da Bandeira',    color: '#ffc38e' },
  { id: 3, title: 'Xand Avião',        sub: '17 Jun  •  Parque de Exposições', color: '#f5b070' },
  { id: 5, title: 'Wesley Safadão',    sub: '18 Jun  •  Praça da Bandeira',    color: '#f0a060' },
  { id: 6, title: 'Mastruz com Leite', sub: '18 Jun  •  Praça Dominguinhos',   color: '#e89050' },
];

const TRANSPORTE = [
  { id: 101, title: 'Van Serrana Tur',       origin: 'Pesqueira',          price: 'R$ 35', schedule: 'Saída 19h  •  Volta 02h',    contact: '87991110001' },
  { id: 102, title: 'Kombi do Marquinhos',   origin: 'Sertânia',           price: 'R$ 40', schedule: 'Saída 18h30  •  Volta 01h',  contact: '87991110002' },
  { id: 103, title: 'Ônibus Festejo',        origin: 'Caruaru',            price: 'R$ 55', schedule: 'Saída 17h  •  Volta 03h',    contact: '81991110003' },
  { id: 104, title: 'Van do Seu Manoel',     origin: 'Buíque',             price: 'R$ 30', schedule: 'Saída 20h  •  Volta 02h',    contact: '87991110004' },
  { id: 105, title: 'Transporte Forrozão',   origin: 'Arcoverde (Centro)', price: 'R$ 15', schedule: 'A cada 30 min a partir das 18h', contact: '87991110005' },
  { id: 106, title: 'Micro-ônibus Xodó',    origin: 'Venturosa',          price: 'R$ 25', schedule: 'Saída 19h30  •  Volta 02h30', contact: '87991110006' },
];

const TRANSPORT_ORIGINS = ['Todas', ...new Set(TRANSPORTE.map(t => t.origin))];

const MAP_CONFIG = {
  center: { lat: -8.4186, lng: -37.0544 },
  zoom: 15,
};

// Filtros de data derivados dos itens (ordem de inserção, sem repetição)
const DATE_FILTERS = ['Todos', ...new Set(
  ITEMS.map(i => i.dateFilter).filter(f => f !== 'Todos')
)];
