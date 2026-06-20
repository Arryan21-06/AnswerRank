from unittest.mock import patch, MagicMock
from uuid import uuid4
from app.services.scoring.score_calculator import calculate_score

@patch('app.services.scoring.score_calculator.supabase_client')
def test_calculate_score(mock_supabase):
    # Setup mock
    mock_table = MagicMock()
    mock_supabase.table.return_value = mock_table

    mock_insert = MagicMock()
    mock_table.insert.return_value = mock_insert

    mock_update = MagicMock()
    mock_table.update.return_value = mock_update
    mock_eq = MagicMock()
    mock_update.eq.return_value = mock_eq

    audit_id = uuid4()

    ai_scores = {
        "source citations": 0.8,
        "expertise signals": 0.7,
        "factual accuracy": 0.9,
        "structured formatting": 0.85,
        "engagement metrics": 0.75,
    }

    # Run
    final_score = calculate_score(audit_id, ai_scores)

    # Assert
    assert final_score > 0
    assert final_score <= 100

    assert abs(final_score - 80.0) < 0.001

    mock_supabase.table.assert_any_call("score_records")
    mock_supabase.table.assert_any_call("audits")
