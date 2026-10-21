import { DependencyPicker } from "@/components/dependency-picker";
import { CmdBuilder } from "@/components/cmd-builder";
import { ProjectSettings } from "@/components/project-settings";
import { SpringProjectProvider } from "@/components/spring-project-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-6">
      <SpringProjectProvider>
        <CmdBuilder />
        <Card className="w-full max-w-6xl [--card-spacing:--spacing(6)] sm:[--card-spacing:--spacing(10)]">
          <CardContent className="grid min-h-90 grid-cols-1 gap-8 sm:min-h-130 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-0 md:px-0">
            <div className="flex min-w-0 items-start md:px-10">
              <ProjectSettings />
            </div>
            <Separator orientation="vertical" className="hidden md:block" />
            <Separator className="md:hidden" />
            <div className="flex min-w-0 items-start md:px-10">
              <DependencyPicker />
            </div>
          </CardContent>
        </Card>
      </SpringProjectProvider>
    </main>
  );
}
