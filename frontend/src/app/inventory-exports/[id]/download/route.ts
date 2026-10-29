import { getApiSessionHeaders } from "@/lib/getApiSessionHeaders.server";
import { redirect, unstable_rethrow } from "next/navigation";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const headers = { "Cache-Control": "no-store, private" };

  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) {
    return Response.json(
      { error: "Invalid export ID." },
      { status: 400, headers },
    );
  }

  const apiUrl = process.env.STOCKPILOT_API_URL;

  if (!apiUrl) {
    return Response.json(
      { error: "Downloads are unavailable." },
      { status: 503, headers },
    );
  }

  try {
    const sessionHeaders = await getApiSessionHeaders();

    const response = await fetch(
      new URL(`/api/inventory-exports/${id}/download`, apiUrl),
      {
        headers: { ...sessionHeaders, Accept: "text/csv" },
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.any([
          request.signal,
          AbortSignal.timeout(30_000),
        ]),
      },
    );

    if (response.status === 401) {
      redirect("/login");
    }

    if (response.status !== 200 || response.body === null) {
      const status = [403, 404, 409].includes(response.status)
        ? response.status
        : 502;

      return Response.json(
        { error: "Export download is unavailable." },
        { status, headers },
      );
    }

    return new Response(response.body, {
      headers: {
        ...headers,
        "Content-Type": "text/csv; charset=UTF-8",
        "Content-Disposition":
          `attachment; filename="inventory-export-${id}.csv"`,
      },
    });
  } catch (error) {
    unstable_rethrow(error);

    return Response.json(
      { error: "Unable to download the export." },
      { status: 502, headers },
    );
  }
}