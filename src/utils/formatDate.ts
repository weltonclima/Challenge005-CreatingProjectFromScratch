import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

format(
	new Date(),
	"'Hoje é' eeee",
	{
		locale: ptBR,
	}
)

export function formatDate(isoDate) {
  const formattedDate = format(
    new Date(isoDate),
    "dd MMM yyyy",
    {
      locale: ptBR,
    }
  );

  return formattedDate;
}
