import type { ProjectOptions } from "@/lib/spring";

export async function GET() {
  try {
    const response = await fetch("https://start.spring.io/metadata/client", {
      headers: { Accept: "application/vnd.initializr.v2.3+json" },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error("Spring metadata request failed");

    const metadata = await response.json();
    const options: ProjectOptions = {
      type: {
        default: metadata.type.default,
        values: metadata.type.values
          .filter((item: { action: string }) => item.action === "/starter.zip")
          .map(({ id, name }: { id: string; name: string }) => ({ id, name })),
      },
      language: metadata.language,
      bootVersion: metadata.bootVersion,
      packaging: metadata.packaging,
      configurationFileFormat: {
        default: "properties",
        values: metadata.configurationFileFormat.values.filter(
          (item: { id: string }) => item.id === "properties",
        ),
      },
      javaVersion: metadata.javaVersion,
      groupId: metadata.groupId,
      artifactId: metadata.artifactId,
      packageName: metadata.packageName,
    };

    return Response.json(options, {
      headers: { "Cache-Control": "public, max-age=300" },
    });
  } catch {
    return Response.json(
      { error: "Could not load project settings. Please try again." },
      { status: 502 },
    );
  }
}
