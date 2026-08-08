use axum::{
    extract::State,
    http::{HeaderValue, Method, StatusCode},
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use std::net::SocketAddr;
use std::sync::{Arc, Mutex};
use tower_http::cors::CorsLayer;

#[derive(Clone, Serialize, Deserialize)]
struct ProfileInfo {
    name: String,
    title: String,
    location: String,
    email: String,
    instagram: String,
    twitter: String,
    github: String,
    essentials: Vec<String>,
    ventures: Vec<Venture>,
}

#[derive(Clone, Serialize, Deserialize)]
struct Venture {
    id: String,
    name: String,
    role: String,
    description: String,
}

#[derive(Clone, Serialize, Deserialize)]
struct QnaItem {
    id: String,
    question: String,
    author: String,
    answer: Option<String>,
    timestamp: String,
}

#[derive(Deserialize)]
struct CreateQnaRequest {
    author: String,
    question: String,
}

#[derive(Deserialize)]
struct SubscribeRequest {
    email: String,
}

#[derive(Deserialize)]
struct BroadcastRequest {
    subject: String,
    content: String,
}

#[derive(Clone)]
struct AppState {
    qna_list: Arc<Mutex<Vec<QnaItem>>>,
    subscribers: Arc<Mutex<Vec<String>>>,
}

#[tokio::main]
async fn main() {
    println!("🚀 Starting Ivan Affriandi Rust Full-Stack Backend API...");

    let initial_qna = vec![
        QnaItem {
            id: "1".to_string(),
            question: "Berapa lama biasanya pengerjaan 1 project website / UI design system?".to_string(),
            author: "Ahmad Rizky".to_string(),
            answer: Some("Tergantung scope project. Untuk landing page minimalis 1-2 minggu, sedangkan full-stack web application & design system biasanya 3-6 minggu.".to_string()),
            timestamp: "Today".to_string(),
        },
        QnaItem {
            id: "2".to_string(),
            question: "Software & tech stack favorit untuk merancang web modern?".to_string(),
            author: "Sarah W.".to_string(),
            answer: Some("Next.js / React untuk web frontend, Rust (Axum/Actix) untuk high-performance microservices backend, Tailwind & CSS murni untuk styling, serta Figma untuk UI/UX systems.".to_string()),
            timestamp: "Yesterday".to_string(),
        },
    ];

    let state = AppState {
        qna_list: Arc::new(Mutex::new(initial_qna)),
        subscribers: Arc::new(Mutex::new(vec!["hello@ivanaffriandi.com".to_string()])),
    };

    let cors = CorsLayer::new()
        .allow_origin("*".parse::<HeaderValue>().unwrap())
        .allow_methods([Method::GET, Method::POST, Method::OPTIONS])
        .allow_headers([axum::http::header::CONTENT_TYPE]);

    let app = Router::new()
        .route("/api/health", get(health_check))
        .route("/api/profile", get(get_profile))
        .route("/api/qna", get(get_qna).post(create_qna))
        .route("/api/newsletter/subscribe", post(subscribe_newsletter))
        .route("/api/newsletter/broadcast", post(broadcast_newsletter))
        .route("/api/newsletter/subscribers", get(get_subscribers))
        .layer(cors)
        .with_state(state);

    let addr = SocketAddr::from(([127, 0, 0, 1], 8080));
    println!("⚡ Rust Backend API server listening on http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn health_check() -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "status": "ok",
        "service": "Ivan Affriandi Rust Full-Stack API",
        "engine": "Axum / Tokio / Rust 1.97",
        "version": "1.0.0"
    }))
}

async fn get_profile() -> Json<ProfileInfo> {
    Json(ProfileInfo {
        name: "Ivan Affriandi".to_string(),
        title: "Full-Stack Web Engineer & UI/UX Designer".to_string(),
        location: "Jakarta & Remote (Indonesia & Worldwide)".to_string(),
        email: "hello@ivanaffriandi.com".to_string(),
        instagram: "@ivanaffriandi".to_string(),
        twitter: "@ivanaffriandi".to_string(),
        github: "@ivanaffriandi".to_string(),
        essentials: vec![
            "Chamomile & Green Tea".to_string(),
            "Minimal Film Photography".to_string(),
            "Rust & TypeScript Systems".to_string(),
        ],
        ventures: vec![
            Venture {
                id: "01".to_string(),
                name: "Full-Stack Web Engineering".to_string(),
                role: "Web & Systems Architect".to_string(),
                description: "Building clean web applications, Next.js & Rust backends, high-performance APIs, and fast digital systems.".to_string(),
            },
            Venture {
                id: "02".to_string(),
                name: "UI/UX & Design Systems".to_string(),
                role: "Lead Product Designer".to_string(),
                description: "Designing minimal user interfaces, tactile interaction details, clean typography, and intuitive user flows.".to_string(),
            },
            Venture {
                id: "03".to_string(),
                name: "SHŪ / EN Studio".to_string(),
                role: "Creative Director".to_string(),
                description: "Architectural & interior visualization studio creating high-precision 3D renders and spatial light simulations.".to_string(),
            },
            Venture {
                id: "04".to_string(),
                name: "KVR Objects".to_string(),
                role: "Hardware Architect".to_string(),
                description: "Industrial hardware design, tactile desk objects, and precision-machined aluminum accessories.".to_string(),
            },
            Venture {
                id: "05".to_string(),
                name: "Equilibriumians".to_string(),
                role: "Publisher & Founder".to_string(),
                description: "Independent publication exploring software engineering, minimalist aesthetics, and visual arts.".to_string(),
            },
        ],
    })
}

async fn get_qna(State(state): State<AppState>) -> Json<Vec<QnaItem>> {
    let list = state.qna_list.lock().unwrap().clone();
    Json(list)
}

async fn create_qna(
    State(state): State<AppState>,
    Json(payload): Json<CreateQnaRequest>,
) -> (StatusCode, Json<QnaItem>) {
    let mut list = state.qna_list.lock().unwrap();
    let new_item = QnaItem {
        id: (list.len() + 1).to_string(),
        question: payload.question,
        author: if payload.author.trim().is_empty() {
            "Anonymous".to_string()
        } else {
            payload.author
        },
        answer: None,
        timestamp: "Just now".to_string(),
    };
    list.push(new_item.clone());
    (StatusCode::CREATED, Json(new_item))
}

async fn subscribe_newsletter(
    State(state): State<AppState>,
    Json(payload): Json<SubscribeRequest>,
) -> (StatusCode, Json<serde_json::Value>) {
    let email = payload.email.trim().to_lowercase();
    if email.is_empty() || !email.contains('@') {
        return (
            StatusCode::BAD_REQUEST,
            Json(serde_json::json!({ "error": "Invalid email address" })),
        );
    }

    let mut subs = state.subscribers.lock().unwrap();
    if !subs.contains(&email) {
        subs.push(email.clone());
    }

    (
        StatusCode::OK,
        Json(serde_json::json!({
            "success": true,
            "message": "Subscribed to Ivan's quiet journal",
            "email": email,
            "total_subscribers": subs.len()
        })),
    )
}

async fn broadcast_newsletter(
    State(state): State<AppState>,
    Json(payload): Json<BroadcastRequest>,
) -> (StatusCode, Json<serde_json::Value>) {
    let subs = state.subscribers.lock().unwrap().clone();
    println!("📧 [Rust Broadcast Service] Sending '{}' to {} subscribers", payload.subject, subs.len());

    (
        StatusCode::OK,
        Json(serde_json::json!({
            "success": true,
            "message": format!("Broadcast successfully dispatched to {} subscribers", subs.len()),
            "recipients_count": subs.len(),
            "subject": payload.subject
        })),
    )
}

async fn get_subscribers(State(state): State<AppState>) -> Json<serde_json::Value> {
    let subs = state.subscribers.lock().unwrap().clone();
    Json(serde_json::json!({
        "total_subscribers": subs.len(),
        "subscribers": subs
    }))
}
