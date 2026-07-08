from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.ai.mock_analyzer import analyze_caption
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

    session_id = "default-session"

    try:
        await connection_manager.send_json(
            websocket,
            {
                "type": "server.connected",
                "payload": {
                    "message": "Conectado ao servidor FastAPI",
                    "sessionId": session_id,
                },
            },
        )

        print("[WebSocket] Mensagem inicial enviada ao cliente.", flush=True)

        while True:
            message = await websocket.receive_json()

            print("[WebSocket] Mensagem recebida:", message, flush=True)

            message_type = message.get("type")
            payload = message.get("payload", {})

            if message_type == "caption.received":
                print("[Meeting] Legenda recebida:", payload, flush=True)

                meeting_manager.add_caption(session_id, payload)

                recent_captions = meeting_manager.get_recent_captions(session_id)

                insights = analyze_caption(
                    caption=payload,
                    recent_captions=recent_captions,
                )

                print("[AI] Insights gerados:", insights, flush=True)

                for insight in insights:
                    await connection_manager.send_json(
                        websocket,
                        {
                            "type": "insight.received",
                            "payload": insight,
                        },
                    )

                    print("[WebSocket] Insight enviado:", insight, flush=True)

                continue

            if message_type == "meeting.snapshot.requested":
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