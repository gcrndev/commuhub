import { getSupabaseClient } from '../lib/supabase';
//import type { Documento, Evento, Votacao, VotacaoStatus } from '../types/models';
import type { Evento, Votacao, VotacaoStatus } from '../types/models';

type VotacaoRow = {
  id: string | number;
  title: string;
  description: string;
  deadline: string;
  status: VotacaoStatus;
  user_voted: boolean;
  user_vote: string | null;
  votes_sim: number;
  votes_nao: number;
  votes_abstencao: number;
  total_voters: number;
  is_private: boolean;
};

type DocumentoRow = {
  id: string | number;
  title: string;
  category: string;
  type: string;
  date: string;
  size: string;

  file_path: string;
  mime_type: string;
};

type EventoRow = {
  id: string | number;
  title: string;
  date: string;
  time: string;
  location: string;
};

export async function getVotacoes(): Promise<Votacao[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('votacoes')
    .select(
      'id,title,description,deadline,status,user_voted,user_vote,votes_sim,votes_nao,votes_abstencao,total_voters,is_private',
    )
    .order('id', { ascending: true });

  if (error) {
    throw error;
  }

  return ((data ?? []) as VotacaoRow[]).map(row => ({
    id: String(row.id),
    title: row.title,
    description: row.description,
    deadline: row.deadline,
    status: row.status,
    userVoted: row.user_voted,
    userVote: row.user_vote,
    votes: {
      sim: row.votes_sim,
      nao: row.votes_nao,
      abstencao: row.votes_abstencao,
    },
    totalVoters: row.total_voters,
    is_private: row.is_private ?? false,
  }));
}

export async function getDocumentos(): Promise<any[]> {
  // Nota: Alterei para any temporariamente até atualizar para o type global
  const supabase = getSupabaseClient();

  // 2. Atualizar a query ao Supabase para puxar as novas colunas
  const { data, error } = await supabase
    .from('documentos')
    .select('id,title,category,type,date,size,file_path,mime_type')
    .order('id', { ascending: true });

  if (error) {
    throw error;
  }

  // 3. Mapear os dados que vêm do Supabase para o formato da App
  return ((data ?? []) as DocumentoRow[]).map(row => ({
    id: String(row.id),
    title: row.title,
    category: row.category,
    type: row.type,
    date: row.date,
    size: row.size,
    filePath: row.file_path, // <-- convertemos de snake_case para camelCase para a UI
    mimeType: row.mime_type,
  }));
}

export async function getEventos(): Promise<Evento[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('eventos')
    .select('id,title,date,time,location')
    .order('date', { ascending: true })
    .order('time', { ascending: true });

  if (error) {
    throw error;
  }

  return ((data ?? []) as EventoRow[]).map(row => ({
    id: String(row.id),
    title: row.title,
    date: row.date,
    time: row.time.slice(0, 5),
    location: row.location,
  }));
}
