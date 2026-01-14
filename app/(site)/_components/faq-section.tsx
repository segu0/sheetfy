import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Como funciona a integração com o Google Sheets?",
    answer:
      "Você faz login com sua conta Google, autoriza o acesso e seleciona qual planilha deseja transformar em API. Nosso sistema detecta automaticamente todas as abas e colunas. Os dados continuam no seu Google Sheets e qualquer alteração reflete na API em tempo real.",
  },
  {
    question: "Preciso saber programar para usar?",
    answer:
      "Não. A plataforma é totalmente visual e intuitiva. Você apenas conecta sua planilha, configura as permissões (GET, POST, PATCH, DELETE) através de toggles simples e recebe sua API pronta. Exemplos de código são fornecidos automaticamente para facilitar a integração.",
  },
  {
    question: "Quais são os limites de cada plano?",
    answer:
      "O plano Starter oferece 3 APIs, 10.000 requisições/mês e 1.000 linhas. O Pro tem 10 APIs, 100.000 requisições/mês e 10.000 linhas. O Business oferece APIs ilimitadas, 500.000 requisições/mês e 100.000 linhas por planilha.",
  },
  {
    question: "Como funciona a segurança das APIs?",
    answer:
      "Cada API recebe uma chave exclusiva (API Key) gerada automaticamente. Você pode configurar autenticação Bearer Token para proteger endpoints específicos. Também é possível controlar exatamente quais operações (GET, POST, PATCH, DELETE) são permitidas em cada aba da planilha.",
  },
  {
    question: "Os dados ficam armazenados na plataforma?",
    answer:
      "Não. Seus dados permanecem 100% no Google Sheets. Nossa plataforma apenas cria uma camada de API sobre sua planilha, sincronizando em tempo real. Você mantém total controle e propriedade dos seus dados, podendo editá-los diretamente no Google Sheets quando quiser.",
  },
];

export function FaqSection() {
  return (
    <section className="mx-auto mt-40 max-w-5xl px-4" id="faq">
      <p className="mx-auto mt-10 max-w-lg text-center text-4xl font-semibold tracking-tight text-balance text-gray-950 sm:text-5xl">
        Perguntas frequentes
      </p>
      <Accordion type="single" collapsible className="mt-10 w-full space-y-3">
        {faqs &&
          faqs.map((faq, index) => (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger className="cursor-pointer text-xl font-medium">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
      </Accordion>
    </section>
  );
}
