from fastapi import APIRouter, Depends, HTTPException, Query, Response
from fastapi.responses import StreamingResponse
import httpx
import urllib.parse

router = APIRouter(prefix="/proxy", tags=["Privacy Proxy"])

@router.get("/image")
async def proxy_remote_image(url: str = Query(...)):
    """Proxies remote images to eliminate IP tracking pixels and referrer headers."""
    decoded_url = urllib.parse.unquote(url)

    if not (decoded_url.startswith("http://") or decoded_url.startswith("https://")):
        raise HTTPException(status_code=400, detail="Invalid image protocol")

    # Prevent SSRF to internal localhost/private subnets
    for forbidden in ["127.0.0.1", "localhost", "10.", "192.168.", "172.16.", "169.254."]:
        if forbidden in decoded_url:
            raise HTTPException(status_code=403, detail="Forbidden proxy target")

    try:
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
            resp = await client.get(
                decoded_url,
                headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ImageProxy/1.0"}
            )
            content_type = resp.headers.get("Content-Type", "image/png")
            return Response(
                content=resp.content,
                media_type=content_type,
                headers={"Cache-Control": "public, max-age=86400"}
            )
    except Exception:
        raise HTTPException(status_code=502, detail="Failed to fetch proxy image")
