import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

type DateFormatterProps = {
  dateString: string;
};

export function DateFormatter({ dateString }: DateFormatterProps) {
  const date = parseISO(dateString);
  return (
    <time dateTime={dateString}>{format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}</time>
  );
}
