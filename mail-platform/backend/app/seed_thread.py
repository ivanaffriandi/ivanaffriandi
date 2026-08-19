import asyncio
from datetime import datetime, timezone, timedelta
import uuid
from sqlalchemy.future import select

from app.core.db import AsyncSessionLocal
from app.models.message import Message, Thread
from app.models.mailbox import Mailbox, MailboxType
from app.models.user import User

async def seed_thread():
    async with AsyncSessionLocal() as db:
        stmt = select(User).where(User.email == 'hello@ivanaffriandi.com')
        res = await db.execute(stmt)
        user = res.scalar_one_or_none()
        if not user:
            print('User hello@ivanaffriandi.com not found')
            return

        stmt2 = select(Mailbox).where(Mailbox.user_id == user.id, Mailbox.type == MailboxType.INBOX)
        res2 = await db.execute(stmt2)
        inbox = res2.scalar_one_or_none()
        if not inbox:
            print('Inbox not found')
            return

        now = datetime.now(timezone.utc)
        thread = Thread(
            user_id=user.id,
            subject='Q3 Product Launch & Architecture Review',
            snippet='Awesome news! The new Apple-style interface looks incredibly sleek and responsive...',
            message_count=3,
            last_message_at=now - timedelta(minutes=15)
        )
        db.add(thread)
        await db.flush()

        msg1 = Message(
            user_id=user.id,
            mailbox_id=inbox.id,
            thread_id=thread.id,
            sender_address='sarah.connor@linear.app',
            sender_name='Sarah Connor',
            recipient_to='hello@ivanaffriandi.com',
            subject='Q3 Product Launch & Architecture Review',
            body_plain='Hey Ivan,\n\nWanted to check in on the latest deployment milestones for the mail platform.\nAre we still on track for the Friday release?\n\nBest,\nSarah',
            body_html='<p>Hey Ivan,</p><p>Wanted to check in on the latest deployment milestones for the mail platform.<br/>Are we still on track for the Friday release?</p><p>Best,<br/>Sarah</p>',
            date=now - timedelta(hours=3),
            is_read=True
        )

        msg2 = Message(
            user_id=user.id,
            mailbox_id=inbox.id,
            thread_id=thread.id,
            sender_address='hello@ivanaffriandi.com',
            sender_name='Ivan Affriandi',
            recipient_to='sarah.connor@linear.app',
            subject='Re: Q3 Product Launch & Architecture Review',
            body_plain='Hi Sarah,\n\nYes! All backend microservices are passing health checks, MTA-STS is active, and DKIM 2048-bit signing is verified.\nI will finalize the UI polish today.\n\nRegards,\nIvan',
            body_html='<p>Hi Sarah,</p><p>Yes! All backend microservices are passing health checks, MTA-STS is active, and DKIM 2048-bit signing is verified.<br/>I will finalize the UI polish today.</p><p>Regards,<br/>Ivan</p>',
            date=now - timedelta(hours=1),
            is_read=True
        )

        msg3 = Message(
            user_id=user.id,
            mailbox_id=inbox.id,
            thread_id=thread.id,
            sender_address='sarah.connor@linear.app',
            sender_name='Sarah Connor',
            recipient_to='hello@ivanaffriandi.com',
            subject='Re: Q3 Product Launch & Architecture Review',
            body_plain='Awesome news! The new Apple-style interface looks incredibly sleek and responsive.\nLet us schedule the final sign-off call at 3 PM.\n\nCheers,\nSarah',
            body_html='<div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif;"><p>Awesome news! The new Apple-style interface looks incredibly sleek and responsive.</p><p>Let us schedule the final sign-off call at 3 PM today.</p><blockquote style="margin-top: 16px; padding: 12px 16px; border-left: 3px solid #3b82f6; background: rgba(59,130,246,0.06); border-radius: 12px;"><p style="color: #64748b; font-size: 12px; margin-bottom: 4px;"><b>Ivan Affriandi</b> wrote:</p><p style="margin: 0; color: #334155;">Yes! All backend microservices are passing health checks, MTA-STS is active, and DKIM 2048-bit signing is verified.<br/>I will finalize the UI polish today.</p></blockquote><p style="margin-top: 16px;">Cheers,<br/>Sarah</p></div>',
            date=now - timedelta(minutes=15),
            is_read=False
        )

        db.add_all([msg1, msg2, msg3])
        await db.commit()
        print('Conversation thread seeded successfully!')

if __name__ == '__main__':
    asyncio.run(seed_thread())
