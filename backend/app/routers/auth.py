from fastapi import APIRouter, Depends, HTTPException, status
from backend.app.core.config import settings
from backend.app.core.security import verify_password, hash_password, create_access_token
from backend.app.core.deps import get_current_user
from backend.app.repositories.users_repo import users_repo
from backend.app.schemas.auth import LoginRequest, TokenResponse, UserInfo, ChangePasswordRequest

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest):
    email = req.email.strip().lower()
    user = users_repo.get_by_email(email)
    
    # Auto-seed admin user if logging in with configured admin credentials and not yet present in DB
    if not user and email == settings.ADMIN_EMAIL:
        if req.password == settings.ADMIN_PASSWORD:
            admin_hash = hash_password(settings.ADMIN_PASSWORD)
            user = users_repo.create(
                email=settings.ADMIN_EMAIL,
                password_hash=admin_hash,
                role="admin",
                full_name="Property Operations Manager",
                phone="(512) 555-0100"
            )
        else:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid admin credentials")
            
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
        
    if not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
        
    token = create_access_token({
        "sub": str(user["id"]),
        "role": user["role"],
        "email": user["email"],
        "full_name": user["full_name"]
    })
    
    user_info = UserInfo(
        id=str(user["id"]),
        email=user["email"],
        role=user["role"],
        full_name=user["full_name"],
        phone=user.get("phone")
    )
    
    return TokenResponse(access_token=token, token_type="bearer", user=user_info)

@router.get("/me", response_model=UserInfo)
async def get_me(current_user: dict = Depends(get_current_user)):
    user = users_repo.get_by_id(current_user["id"])
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return UserInfo(
        id=str(user["id"]),
        email=user["email"],
        role=user["role"],
        full_name=user["full_name"],
        phone=user.get("phone")
    )

@router.post("/change-password")
async def change_password(req: ChangePasswordRequest, current_user: dict = Depends(get_current_user)):
    user = users_repo.get_by_id(current_user["id"])
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
    if not verify_password(req.old_password, user["password_hash"]):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password incorrect")
        
    if len(req.new_password) < 6:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password must be at least 6 characters")
        
    new_hash = hash_password(req.new_password)
    users_repo.update_password(current_user["id"], new_hash)
    return {"status": "success", "message": "Password updated successfully"}

