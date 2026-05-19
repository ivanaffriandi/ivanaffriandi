import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { NextResponse } from "next/server";

// Inisialisasi Firebase Admin SDK secara aman (Otomatis mendeteksi kredensial lokal & online!)
if (!getApps().length) {
  initializeApp({
    projectId: "ivan-affriandi"
  });
}

const db = getFirestore();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const answeredOnly = searchParams.get("answered") === "true";

    // Mengambil semua dokumen questions lewat Admin SDK (Bypass rules & Super Cepat)
    const snapshot = await db.collection("questions").get();
    let items: any[] = [];
    
    snapshot.forEach(doc => {
      items.push({ id: doc.id, ...doc.data() });
    });

    // Mengurutkan secara instan di memori (Menghindari keharusan membuat Composite Index)
    items.sort((a: any, b: any) => new Date(b.published).getTime() - new Date(a.published).getTime());

    if (answeredOnly) {
      items = items.filter((item: any) => item.answered === true);
    }

    return NextResponse.json(items);
  } catch (err) {
    console.error("GET Questions Admin SDK error:", err);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const { content } = await request.json();
    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const newQuestion = {
      content,
      published: new Date().toISOString(),
      answered: false
    };

    // Menulis pesan baru ke Firestore tanpa hambatan permission rules
    const docRef = await db.collection("questions").add(newQuestion);
    return NextResponse.json({ id: docRef.id, ...newQuestion });
  } catch (err) {
    console.error("POST Question Admin SDK error:", err);
    return NextResponse.json({ error: "Failed to add question" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, answerText } = await request.json();
    if (!id || !answerText) {
      return NextResponse.json({ error: "ID and answerText are required" }, { status: 400 });
    }

    // Mengupdate jawaban dan status terbit dari Admin Dashboard
    await db.collection("questions").doc(id).update({
      answered: true,
      answer: answerText
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PUT Question Admin SDK error:", err);
    return NextResponse.json({ error: "Failed to answer question" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // Menghapus pesan lewat Admin SDK
    await db.collection("questions").doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE Question Admin SDK error:", err);
    return NextResponse.json({ error: "Failed to delete question" }, { status: 500 });
  }
}
