from zxcvbn import zxcvbn
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import pyotp
from pydantic import BaseModel, Field

# Limiter (ograniczenie prób logowania)
limiter = Limiter(key_func=get_remote_address)

def validate_password(password):
    result = zxcvbn(password)
    return result['score'] >= 3  # Wymagana si³a has³a

def generate_otp_secret():
    return pyotp.random_base32()

def verify_otp(secret, otp):
    totp = pyotp.TOTP(secret)
    return totp.verify(otp)


class UserRegistrationModel(BaseModel):
    username: str = Field(..., min_length=3, max_length=15, pattern="^[a-zA-Z0-9_]+$")
    password: str = Field(..., min_length=8)

