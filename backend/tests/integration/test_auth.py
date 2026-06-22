from fastapi.testclient import TestClient
from app.main import app
from unittest.mock import patch, MagicMock
from uuid import uuid4

client = TestClient(app)


@patch("app.api.v1.auth.supabase_client")
def test_register_creator(mock_supabase):
    mock_uuid = str(uuid4())
    # Setup mock for auth
    mock_auth_response = MagicMock()
    mock_auth_response.user.id = mock_uuid
    mock_supabase.auth.sign_up.return_value = mock_auth_response

    # Setup mock for table inserts
    mock_table = MagicMock()
    mock_supabase.table.return_value = mock_table
    mock_insert = MagicMock()
    mock_table.insert.return_value = mock_insert

    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@creator.com",
            "password": "password123",
            "role": "creator",
            "full_name": "Test Creator",
        },
    )

    assert response.status_code == 201
    data = response.json()
    assert data["message"] == "User registered successfully"
    assert data["user"]["email"] == "test@creator.com"
    assert data["user"]["id"] == mock_uuid
    assert data["user"]["role"] == "creator"

    # Verify tables called
    mock_supabase.table.assert_any_call("users")
    mock_supabase.table.assert_any_call("creator_profiles")
    mock_supabase.table.assert_any_call("subscriptions")


@patch("app.api.v1.auth.supabase_client")
def test_login(mock_supabase):
    mock_uuid = str(uuid4())
    # Setup mock for auth
    mock_auth_response = MagicMock()
    mock_auth_response.session.access_token = "mock_access_token"
    mock_auth_response.session.refresh_token = "mock_refresh_token"
    mock_auth_response.user.id = mock_uuid
    mock_supabase.auth.sign_in_with_password.return_value = mock_auth_response

    # Setup mock for public.users DB call
    mock_table = MagicMock()
    mock_supabase.table.return_value = mock_table
    mock_select = MagicMock()
    mock_table.select.return_value = mock_select
    mock_eq = MagicMock()
    mock_select.eq.return_value = mock_eq
    mock_single = MagicMock()
    mock_eq.single.return_value = mock_single
    mock_execute = MagicMock()
    mock_single.execute.return_value = mock_execute

    # Return user row
    mock_execute.data = {
        "id": mock_uuid,
        "email": "test@creator.com",
        "role": "creator",
        "full_name": "Test Creator",
        "created_at": "2023-01-01T00:00:00Z",
        "updated_at": "2023-01-01T00:00:00Z",
        "last_login": "2023-01-01T00:00:00Z",
    }

    response = client.post(
        "/api/v1/auth/login",
        json={"email": "test@creator.com", "password": "password123"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["access_token"] == "mock_access_token"
    assert data["refresh_token"] == "mock_refresh_token"
    assert data["user"]["id"] == mock_uuid
    assert data["user"]["role"] == "creator"
