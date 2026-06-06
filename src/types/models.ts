export type VotacaoStatus = 'active' | 'closed';

export type Votacao = {
  id: string;
  title: string;
  description: string;
  deadline: string;
  status: VotacaoStatus;
  userVoted: boolean;
  userVote?: string | null;
  votes: {
    sim: number;
    nao: number;
    abstencao: number;
  };
  totalVoters: number;
  is_private: boolean;
};

export type Documento = {
  id: string;
  title: string;
  category: string;
  type: string;
  date: string;
  size: string;

  filePath?: string; 
  mimeType?: string;
};

export type Evento = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description?: string;
};

export type Notification = {
  id: string;
  userId: string;
  title: string;
  body: string;
  data: Record<string, string>;
  createdAt: string;
  read: boolean;
};
