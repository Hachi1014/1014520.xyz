export type ThoughtSummary = {
  id: string;
  category: string;
  title: string;
  minutes: number;
  date: string;
  endDate?: string;
};
export type Thought = ThoughtSummary & { paragraphs: string[]; html?: string };
