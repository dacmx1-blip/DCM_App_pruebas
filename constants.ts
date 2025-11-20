import { Domain, AssessmentOption } from './types';

export const ASSESSMENT_OPTIONS: AssessmentOption[] = [
  { value: '5', label: 'Mejora Continua (Nivel 5)', colorClass: 'bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200', score: 5 },
  { value: '4', label: 'Medido (Nivel 4)', colorClass: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200', score: 4 },
  { value: '3', label: 'Estandarizado (Nivel 3)', colorClass: 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200', score: 3 },
  { value: '2', label: 'Repetible (Nivel 2)', colorClass: 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200', score: 2 },
  { value: '1', label: 'Inicial (Nivel 1)', colorClass: 'bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-200', score: 1 },
  { value: '0', label: 'No Aplica (N/A)', colorClass: 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200', score: 0 },
];

export const DOMAINS: Domain[] = [
  {
    id: 'c4',
    title: '4. Contexto de la Organización',
    description: 'Comprensión de las necesidades internas y externas y definición del alcance del SGSI.',
    questions: [
      { id: 'c4_1', text: '¿Ha definido el alcance de su Sistema de Gestión de Seguridad de la Información (SGSI)?' },
      { id: 'c4_2', text: '¿Identifica las partes interesadas y sus requisitos de seguridad (legales, contractuales, etc.)?' }
    ]
  },
  {
    id: 'c5',
    title: '5. Liderazgo y Política',
    description: 'Compromiso de la alta dirección y establecimiento de una política de seguridad.',
    questions: [
      { id: 'c5_1', text: '¿Existe una Política de Seguridad de la Información aprobada por la alta dirección y comunicada?' },
      { id: 'c5_2', text: '¿Están definidas las responsabilidades de seguridad para el personal clave?' }
    ]
  },
  {
    id: 'c6',
    title: '6. Planificación y Gestión de Riesgos',
    description: 'Identificación, análisis y tratamiento de los riesgos de seguridad.',
    questions: [
      { id: 'c6_1', text: '¿Realiza una evaluación de riesgos de seguridad de la información periódicamente?' },
      { id: 'c6_2', text: '¿Ha definido un Plan de Tratamiento de Riesgos para aplicar los controles necesarios?' }
    ]
  },
  {
    id: 'a5',
    title: 'A.5 Controles Organizacionales',
    description: 'Estructura de seguridad, políticas, uso de activos y seguridad de las relaciones con proveedores.',
    questions: [
      { id: 'a5_1', text: '¿Existen políticas documentadas para el uso aceptable de activos de información (ej. correo electrónico, internet)?' },
      { id: 'a5_2', text: '¿Clasifica la información (pública, interna, confidencial) y la maneja según su clasificación?' },
      { id: 'a5_3', text: '¿Evalúa y gestiona la seguridad de la información de sus proveedores y servicios externos?' }
    ]
  },
  {
    id: 'a6',
    title: 'A.6 Controles de Personas',
    description: 'Seguridad en el empleo, concienciación y seguridad del trabajo remoto.',
    questions: [
      { id: 'a6_1', text: '¿Capacita al personal anualmente en temas de seguridad de la información y concienciación?' },
      { id: 'a6_2', text: '¿Existen procedimientos claros para manejar y sancionar incumplimientos de seguridad (ej. proceso disciplinario)?' },
      { id: 'a6_3', text: '¿Ha establecido medidas de seguridad específicas para el trabajo remoto (ej. VPN, equipos empresariales)?' }
    ]
  },
  {
    id: 'a7',
    title: 'A.7 Controles Físicos',
    description: 'Protección de instalaciones, equipos y medios de almacenamiento.',
    questions: [
      { id: 'a7_1', text: '¿Los servidores y equipos sensibles están alojados en un área física segura con control de acceso?' },
      { id: 'a7_2', text: '¿Los equipos portátiles, dispositivos y medios de almacenamiento (discos) se protegen fuera de la oficina?' }
    ]
  },
  {
    id: 'a8',
    title: 'A.8 Controles Tecnológicos',
    description: 'Controles de acceso, cifrado, copias de seguridad, registro de eventos y protección contra malware.',
    questions: [
      { id: 'a8_1', text: '¿Requiere el uso de contraseñas fuertes o autenticación multifactor (MFA) para acceder a los sistemas clave?' },
      { id: 'a8_2', text: '¿Implementa y mantiene copias de seguridad (backups) regulares de la información crítica?' },
      { id: 'a8_3', text: '¿Utiliza software antivirus o anti-malware actualizado en todos los sistemas operativos?' },
      { id: 'a8_4', text: '¿Registra (logs) y revisa periódicamente los eventos de seguridad en sistemas críticos (ej. intentos fallidos de acceso)?' }
    ]
  }
];