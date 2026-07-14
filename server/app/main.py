from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.ai.analyzer_service import analyzer_service
from app.core.config import settings
from app.meeting.meeting_manager import MeetingManager
from app.websocket.connection_manager import ConnectionManager

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

connection_manager = ConnectionManager()
meeting_manager = MeetingManager()


@app.get("/")
def health_check():
    return {
        "status": "ok",
        "message": "AI Sales Assistant API is running",
        "version": settings.VERSION,
    }


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await connection_manager.connect(websocket)

    print("[WebSocket] Cliente conectado.", flush=True)

    default_session_id = "default-session"

    try:
        await connection_manager.send_json(
            websocket,
            {
                "type": "server.connected",
                "payload": {
                    "message": "Conectado ao servidor FastAPI",
                    "sessionId": default_session_id,
                },
            },
        )

        while True:
            message = await websocket.receive_json()

            message_type = message.get("type")
            payload = message.get("payload", {}) or {}

            if message_type == "caption.received":
                session_id = payload.get("sessionId", default_session_id)
                caption = payload.get("caption", payload)

                speaker = caption.get("speaker", "Participante")
                text = caption.get("text", "")

                print(
                    f"[Meeting] Sessão {session_id} | {speaker}: {text}",
                    flush=True,
                )

                meeting_manager.add_caption(session_id, caption)

                recent_captions = meeting_manager.get_recent_captions(session_id)

                insights = analyzer_service.analyze_caption(
                    caption=caption,
                    recent_captions=recent_captions,
                )

                if insights:
                    print(f"[AI] {len(insights)} insight(s) gerado(s).", flush=True)

                for insight in insights:
                    await connection_manager.send_json(
                        websocket,
                        {
                            "type": "insight.received",
                            "payload": insight,
                        },
                    )

                    print(
                        f"[WebSocket] Insight enviado: {insight.get('title')}",
                        flush=True,
                    )

                continue

            if message_type == "meeting.snapshot.requested":
                session_id = payload.get("sessionId", default_session_id)

                snapshot = meeting_manager.get_snapshot(session_id)

                await connection_manager.send_json(
                    websocket,
                    {
                        "type": "meeting.snapshot.received",
                        "payload": snapshot,
                    },
                )

                continue

            await connection_manager.send_json(
                websocket,
                {
                    "type": "server.warning",
                    "payload": {
                        "message": f"Tipo de mensagem desconhecido: {message_type}"
                    },
                },
            )

    except WebSocketDisconnect:
        print("[WebSocket] Cliente desconectado.", flush=True)
        connection_manager.disconnect(websocket)