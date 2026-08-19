import unittest
from app.core.security import hash_password, verify_password, create_access_token, decode_access_token
from app.services.mime_parser import parse_raw_mime, decode_mime_header
from app.services.sanitizer_service import sanitize_email_html

class TestMailPlatformBackend(unittest.TestCase):
    def test_argon2id_password_hashing(self):
        password = "SuperSecretPassword123!"
        hashed = hash_password(password)
        self.assertNotEqual(hashed, password)
        self.assertTrue(verify_password(password, hashed))
        self.assertFalse(verify_password("WrongPassword", hashed))

    def test_jwt_token_generation_and_decoding(self):
        payload = {"sub": "user_id_123", "email": "hello@ivanaffriandi.com"}
        token = create_access_token(payload)
        decoded = decode_access_token(token)
        self.assertIsNotNone(decoded)
        self.assertEqual(decoded["sub"], "user_id_123")
        self.assertEqual(decoded["email"], "hello@ivanaffriandi.com")

    def test_mime_parser_simple(self):
        raw_email = (
            b"From: Alice <alice@example.com>\r\n"
            b"To: Ivan <hello@ivanaffriandi.com>\r\n"
            b"Subject: Test Email\r\n"
            b"Message-ID: <msg123@example.com>\r\n"
            b"Content-Type: text/plain; charset=utf-8\r\n"
            b"\r\n"
            b"Hello Ivan, this is a test message body."
        )
        parsed = parse_raw_mime(raw_email)
        self.assertEqual(parsed["subject"], "Test Email")
        self.assertIn("alice@example.com", parsed["sender_address"])
        self.assertEqual(parsed["body_plain"], "Hello Ivan, this is a test message body.")
        self.assertEqual(parsed["message_id_header"], "<msg123@example.com>")

    def test_html_sanitizer_neutralizes_xss(self):
        malicious_html = '<p>Safe text</p><script>alert("XSS Attack!");</script><iframe src="evil.html"></iframe><img src="http://tracker.com/pixel.png" onclick="stolen()">'
        sanitized = sanitize_email_html(malicious_html, proxy_images=True)
        self.assertNotIn("<script>", sanitized)
        self.assertNotIn("alert", sanitized)
        self.assertNotIn("<iframe>", sanitized)
        self.assertNotIn("onclick", sanitized)
        self.assertIn("/api/v1/proxy/image?url=", sanitized)

if __name__ == "__main__":
    unittest.main()
