import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const answeredOnly = searchParams.get("answered") === "true";

    // Load all questions directly to bypass Firestore index constraints entirely!
    const querySnapshot = await getDocs(collection(db, "questions"));
    let items: any[] = [];
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() });
    });

    // Perform sorting and filtering in-memory on the server (ultra fast & index-free!)
    items.sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());

    if (answeredOnly) {
      items = items.filter(item => item.answered === true);
    }

    return NextResponse.json(items);
  } catch (err) {
    console.error("GET Questions API error:", err);
    return NextResponse.json([], { status: 500 });
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

    const docRef = await addDoc(collection(db, "questions"), newQuestion);
    return NextResponse.json({ id: docRef.id, ...newQuestion });
  } catch (err) {
    console.error("POST Question API error:", err);
    return NextResponse.json({ error: "Failed to add question" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, answerText } = await request.json();
    if (!id || !answerText) {
      return NextResponse.json({ error: "ID and answerText are required" }, { status: 400 });
    }

    const docRef = doc(db, "questions", id);
    await updateDoc(docRef, { answered: true, answer: answerText });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PUT Question API error:", err);
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

    const docRef = doc(db, "questions", id);
    await deleteDoc(docRef);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE Question API error:", err);
    return NextResponse.json({ error: "Failed to delete question" }, { status: 500 });
  }
}
