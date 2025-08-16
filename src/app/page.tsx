
import { Button } from "@/components/ui/button";
import { Stethoscope, Bot, Users, FileText } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 md:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Stethoscope className="h-7 w-7 text-primary" />
            <h1 className="text-xl font-bold font-headline tracking-tight">
              NotasMed EHR
            </h1>
          </Link>
          <nav className="flex items-center gap-4">
            <Button asChild>
              <Link href="/login">Iniciar Sesión</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-12 md:py-24 lg:py-32 bg-secondary/50">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-foreground">
                Revoluciona tu Práctica Médica con IA
              </h1>
              <p className="mt-6 text-lg text-muted-foreground">
                NotasMed EHR es una plataforma de expedientes clínicos electrónicos que utiliza inteligencia artificial para transcribir y resumir tus consultas, permitiéndote enfocarte en lo que más importa: tus pacientes.
              </p>
              <div className="mt-10">
                <Button size="lg" asChild>
                  <Link href="/signup">Comienza Ahora</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-12 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-foreground">Funcionalidades Principales</h2>
              <p className="mt-4 text-muted-foreground">Todo lo que necesitas para una gestión de pacientes eficiente e inteligente.</p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Bot className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Transcripción y Resumen con IA</h3>
                <p className="mt-2 text-muted-foreground">Graba tus consultas y obtén transcripciones precisas y resúmenes concisos generados por IA en segundos.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Gestión Integral de Pacientes</h3>
                <p className="mt-2 text-muted-foreground">Maneja la información demográfica, citas, signos vitales, medicamentos y procedimientos de tus pacientes en un solo lugar.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Expediente Clínico Organizado</h3>
                <p className="mt-2 text-muted-foreground">Accede a un historial completo y bien estructurado para cada paciente, facilitando el seguimiento y la toma de decisiones.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-24 bg-card">
           <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                        <Image 
                            src="https://placehold.co/600x400.png"
                            alt="Dashboard de NotasMed EHR"
                            width={600}
                            height={400}
                            className="rounded-lg shadow-xl"
                            data-ai-hint="medical dashboard app"
                        />
                    </div>
                    <div className="max-w-md">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground">Interfaz Intuitiva y Fácil de Usar</h2>
                        <p className="mt-4 text-muted-foreground">Diseñada pensando en los profesionales de la salud, nuestra interfaz te permite navegar y encontrar información rápidamente, sin complicaciones.</p>
                    </div>
                </div>
           </div>
        </section>

      </main>

      <footer className="py-6 border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} NotasMed EHR. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

    