export type Folder = {
  id: string;
  user_id: string;
  title: string;
  color: string;
  sort_order: number;
  created_at: string;
};

export type Note = {
  id: string;
  folder_id: string;
  user_id: string;
  content: string;
  created_at: string;
};
