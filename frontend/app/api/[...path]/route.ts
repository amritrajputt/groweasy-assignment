import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, await params);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, await params);
}

async function handleProxy(request: NextRequest, { path }: { path: string[] }) {
  const backendUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const cleanBackendUrl = backendUrl.replace(/\/$/, "");
  const targetPath = path.join("/");
  const dest = `${cleanBackendUrl}/api/${targetPath}${request.nextUrl.search}`;

  try {
    const method = request.method;
    const headers = Object.fromEntries(request.headers.entries());
    
    // Remove host header to avoid SSL certificate issues
    delete headers.host;
    delete headers.connection;

    let body: any = null;
    if (method === "POST") {
      const contentType = request.headers.get("content-type") || "";
      if (contentType.includes("multipart/form-data")) {
        const formData = await request.formData();
        const response = await fetch(dest, {
          method,
          body: formData,
        });
        
        const resData = await response.json();
        return NextResponse.json(resData, { status: response.status });
      } else {
        body = await request.json();
      }
    }

    const response = await fetch(dest, {
      method,
      headers: method === "POST" ? { ...headers, "Content-Type": "application/json" } : headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("Proxy error:", error);
    return NextResponse.json({ message: error.message || "Proxy failed" }, { status: 500 });
  }
}
