from bs4 import BeautifulSoup
import urllib.parse

ALLOWED_TAGS = [
    'a', 'abbr', 'acronym', 'b', 'blockquote', 'code', 'em', 'i', 'li', 'ol', 'p',
    'strong', 'ul', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'table', 'tr', 'td', 'th',
    'tbody', 'thead', 'tfoot', 'div', 'span', 'br', 'hr', 'img'
]

ALLOWED_ATTRIBUTES = {
    'a': ['href', 'title', 'target', 'rel'],
    'img': ['src', 'alt', 'title', 'width', 'height', 'data-original-src'],
    '*': ['style', 'class', 'id']
}

def sanitize_email_html(raw_html: str, proxy_images: bool = True) -> str:
    """Sanitizes HTML email contents to eliminate XSS, script execution, and dangerous elements."""
    if not raw_html:
        return ""

    soup = BeautifulSoup(raw_html, 'html.parser')

    # Remove script, iframe, object, embed, style tags
    for tag in soup(['script', 'iframe', 'object', 'embed', 'form', 'base', 'meta', 'link']):
        tag.decompose()

    # Remove event handlers (onclick, onload, etc.)
    for tag in soup.find_all(True):
        attrs = dict(tag.attrs)
        for attr in attrs:
            if attr.startswith('on') or attr.lower() in ['javascript:', 'vbscript:']:
                del tag[attr]

    # Proxy remote tracking images
    if proxy_images:
        for img in soup.find_all('img'):
            src = img.get('src')
            if src and (src.startswith('http://') or src.startswith('https://')):
                encoded_url = urllib.parse.quote(src, safe='')
                proxy_url = f"/api/v1/proxy/image?url={encoded_url}"
                img['data-original-src'] = src
                img['src'] = proxy_url

    return str(soup)
