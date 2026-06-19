from fastapi import FastAPI, Depends
from app.api.v1.auth import router as auth_router
from app.core.security import get_current_user

app = FastAPI(title="AnswerRank API", version="1.0.0")

# Auth router does not require authentication itself (except logout, which handles it via Depends)
app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])

# Example protected route to demonstrate the middleware
@app.get("/api/v1/protected", dependencies=[Depends(get_current_user)])
def protected_route():
    return {"message": "You have accessed a protected route."}

@app.get("/health")
def health_check():
    return {"status": "ok", "version": "1.0.0"}
