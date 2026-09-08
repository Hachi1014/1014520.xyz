type ThoughtDateProps = { date: string; endDate?: string };

export default function ThoughtDate({ date, endDate }: ThoughtDateProps) {
  return <span>
    <time dateTime={date}>{date.replaceAll('-', '.')}</time>
    {endDate && <> – <time dateTime={endDate}>{endDate.replaceAll('-', '.')}</time></>}
  </span>;
}
