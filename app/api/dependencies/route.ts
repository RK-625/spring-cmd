import type { Dependency } from "@/lib/spring";

export async function GET() {
  try {
    const response = await fetch("https://start.spring.io/metadata/client", {
      headers: { Accept: "application/vnd.initializr.v2.3+json" },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error("Spring metadata request failed");
    const metadata = await response.json();
    const dependencies: Dependency[] = metadata.dependencies.values.flatMap(
      (group: { name: string; values: Omit<Dependency, "group">[] }) =>
        group.values.map(({ id, name, description }) => ({ id, name, description, group: group.name })),
    );
    return Response.json(dependencies, { headers: { "Cache-Control": "public, max-age=300" } });
  } catch {
    return Response.json({ error: "Could not load Spring dependencies. Please try again." }, { status: 502 });
  }
}
