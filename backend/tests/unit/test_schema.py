import uuid
from datetime import datetime
from db.schema import User

def test_user_model_valid():
    user_id = uuid.uuid4()
    now = datetime.now()
    user = User(
        id=user_id,
        email="test@example.com",
        role="creator",
        created_at=now,
        updated_at=now
    )
    assert user.id == user_id
    assert user.email == "test@example.com"
    assert user.role == "creator"
