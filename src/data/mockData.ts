export const mockNotifications = [
  {
    id: 1,
    title: "Nova votação disponível",
    description: "Aprovação do orçamento 2026",
    time: "Há 2 horas",
    unread: true,
  },
  {
    id: 2,
    title: "Documento atualizado",
    description: "Ata da reunião de março",
    time: "Há 5 horas",
    unread: true,
  },
  {
    id: 3,
    title: "Evento próximo",
    description: "Assembleia Geral - 15 Abr",
    time: "Há 1 dia",
    unread: false,
  },
];

export const mockEvents = [
  {
    id: 1,
    title: "Assembleia Geral",
    date: "2026-04-15",
    time: "18:00",
    location: "Sala Principal",
  },
  {
    id: 2,
    title: "Reunião de Diretoria",
    date: "2026-04-18",
    time: "19:30",
    location: "Online",
  },
  {
    id: 3,
    title: "Workshop Comunitário",
    date: "2026-04-22",
    time: "14:00",
    location: "Centro Cultural",
  },
];

export const mockVotacoes = [
  {
    id: 1,
    title: "Aprovação do Orçamento 2026",
    description: "Votação para aprovação do orçamento anual da comunidade",
    deadline: "2026-04-20",
    status: "active",
    votes: {
      sim: 145,
      nao: 38,
      abstencao: 12,
    },
    totalVoters: 250,
    userVoted: false,
  },
  {
    id: 2,
    title: "Reforma do Regulamento Interno",
    description: "Alterações propostas aos artigos 5º, 12º e 18º",
    deadline: "2026-04-25",
    status: "active",
    votes: {
      sim: 89,
      nao: 67,
      abstencao: 8,
    },
    totalVoters: 250,
    userVoted: true,
    userVote: "sim",
  },
  {
    id: 3,
    title: "Nova Infraestrutura Desportiva",
    description: "Investimento em equipamentos desportivos comunitários",
    deadline: "2026-04-10",
    status: "closed",
    votes: {
      sim: 178,
      nao: 45,
      abstencao: 15,
    },
    totalVoters: 250,
    userVoted: true,
    userVote: "sim",
  },
];

export const mockDocumentos = [
  {
    id: 1,
    title: "Ata da Reunião - Março 2026",
    category: "Atas",
    date: "2026-03-28",
    size: "245 KB",
    type: "PDF",
  },
  {
    id: 2,
    title: "Regulamento Interno",
    category: "Regulamentos",
    date: "2026-01-15",
    size: "1.2 MB",
    type: "PDF",
  },
  {
    id: 3,
    title: "Relatório Financeiro Q1 2026",
    category: "Financeiro",
    date: "2026-04-01",
    size: "890 KB",
    type: "PDF",
  },
  {
    id: 4,
    title: "Ata da Reunião - Fevereiro 2026",
    category: "Atas",
    date: "2026-02-25",
    size: "198 KB",
    type: "PDF",
  },
  {
    id: 5,
    title: "Código de Conduta",
    category: "Regulamentos",
    date: "2025-12-10",
    size: "450 KB",
    type: "PDF",
  },
  {
    id: 6,
    title: "Proposta Orçamental 2026",
    category: "Financeiro",
    date: "2025-11-30",
    size: "2.1 MB",
    type: "PDF",
  },
];

export const mockCalendarEvents = [
  ...mockEvents,
  {
    id: 4,
    title: "Jantar Comunitário",
    date: "2026-04-12",
    time: "20:00",
    location: "Restaurante Local",
  },
  {
    id: 5,
    title: "Votação Encerra - Orçamento",
    date: "2026-04-20",
    time: "23:59",
    location: "Online",
  },
  {
    id: 6,
    title: "Sessão de Esclarecimento",
    date: "2026-04-16",
    time: "19:00",
    location: "Auditório",
  },
];

export const mockUser = {
  name: "Maria Silva",
  email: "maria.silva@email.com",
  avatar: "",
  memberId: "M2026-0142",
  memberSince: "2024-01-15",
  role: "Membro Ativo",
  notifications: {
    email: true,
    push: true,
    votacoes: true,
    eventos: true,
    documentos: false,
  },
};
