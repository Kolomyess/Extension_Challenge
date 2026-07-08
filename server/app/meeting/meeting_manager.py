from dataclasses import dataclass, field
from datetime import datetime
from typing import Any


@dataclass
class MeetingSession:
    session_id: str
    started_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    captions: list[dict[str, Any]] = field(default_factory=list)
    participants: set[str] = field(default_factory=set)


class MeetingManager:
    def __init__(self):
        self.sessions: dict[str, MeetingSession] = {}

    def get_or_create_session(self, session_id: str) -> MeetingSession:
        if session_id not in self.sessions:
            self.sessions[session_id] = MeetingSession(session_id=session_id)

        return self.sessions[session_id]

    def add_caption(self, session_id: str, caption: dict[str, Any]):
        session = self.get_or_create_session(session_id)

        session.captions.append(caption)

        speaker = caption.get("speaker")

        if speaker:
            session.participants.add(speaker)

        if len(session.captions) > 500:
            session.captions = session.captions[-500:]

    def get_recent_captions(self, session_id: str, limit: int = 20):
        session = self.get_or_create_session(session_id)

        return session.captions[-limit:]

    def get_snapshot(self, session_id: str):
        session = self.get_or_create_session(session_id)

        return {
            "sessionId": session.session_id,
            "startedAt": session.started_at,
            "participants": list(session.participants),
            "captions": session.captions,
        }