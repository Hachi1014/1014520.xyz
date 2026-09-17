export type DailyEntry = {
  id: string;
  date: string;
  title?: string;
  paragraphs: string[];
  html?: string;
  minutes?: number;
  image?: { src: string; alt: string; width: number; height: number };
};
