import React from 'react';
import { Shield } from 'lucide-react';
import Link from 'next/link';

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-background pt-32 pb-24 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12 text-center md:text-left">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 mx-auto md:mx-0">
            <Shield className="text-primary" size={32} />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4 text-foreground">Termos de Uso</h1>
          <p className="text-muted-foreground text-lg">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
        </div>

        <div className="prose prose-lg dark:prose-invert prose-blue max-w-none text-foreground/80">
          <h2 className="text-2xl font-bold text-foreground mb-4 mt-8">1. Aceitação dos Termos</h2>
          <p className="mb-6">
            Ao acessar e usar a Área do Aluno da PH Donassolo, você concorda em cumprir e ficar vinculado a estes Termos de Uso.
            O acesso aos cursos e ferramentas está condicionado à aceitação total destas condições.
          </p>

          <h2 className="text-2xl font-bold text-foreground mb-4 mt-8">2. Acesso à Área do Aluno</h2>
          <p className="mb-6">
            A Área do Aluno é um ambiente restrito. As credenciais de acesso (e-mail e senha) são de uso pessoal e intransferível.
            O sistema possui mecanismos antifraude que podem bloquear a conta em caso de acessos simultâneos de localizações muito distintas.
          </p>

          <h2 className="text-2xl font-bold text-foreground mb-4 mt-8">3. Propriedade Intelectual e Uso do Material</h2>
          <p className="mb-6">
            Todo o conteúdo disponibilizado na plataforma (aulas gravadas, simuladores, materiais em PDF, apostilas e planilhas) 
            é protegido por direitos autorais e de propriedade intelectual exclusiva da PH Donassolo.
            Você não pode reproduzir, distribuir, modificar, exibir, executar ou transmitir qualquer material sem autorização prévia por escrito.
          </p>

          <h2 className="text-2xl font-bold text-foreground mb-4 mt-8">4. Conduta do Aluno</h2>
          <p className="mb-6">
            O ambiente deve ser utilizado para fins de estudo e aprimoramento profissional. Comentários e interações 
            devem ser respeitosos com professores e demais colegas. O descumprimento destas regras pode resultar na suspensão da conta.
          </p>

          <h2 className="text-2xl font-bold text-foreground mb-4 mt-8">5. Dúvidas e Suporte</h2>
          <p className="mb-6">
            Em caso de dúvidas sobre os termos ou necessidade de suporte técnico na plataforma, entre em contato através dos canais oficiais.
          </p>
          
          <div className="mt-12 pt-8 border-t border-border">
            <Link href="/" className="text-primary hover:underline font-medium">
              &larr; Voltar para o Início
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
