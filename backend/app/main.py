from fastapi import FastAPI, Depends
from app.api.v1.auth import router as auth_router
from app.api.v1.creator import router as creator_router
from app.api.v1.brand import router as brand_router
from app.core.security import get_current_user
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="AnswerRank API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3003",
        "http://localhost:3004",
        "http://localhost:3005",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth router does not require authentication itself (except logout, which handles it via Depends)
app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(creator_router, prefix="/api/v1/creator", tags=["creator"])
app.include_router(brand_router, prefix="/api/v1/brand", tags=["brand"])


# Example protected route to demonstrate the middleware
@app.get("/api/v1/protected", dependencies=[Depends(get_current_user)])
def protected_route():
    return {"message": "You have accessed a protected route."}


@app.get("/health")
def health_check():
    return {"status": "ok", "version": "1.0.0"}
