from zxcvbn import zxcvbn
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import pyotp

# Limiter (ograniczenie prób logowania)
limiter = Limiter(key_func=get_remote_address, default_limits=["5 per minute"])

def validate_password(password):
    result = zxcvbn(password)
    return result['score'] >= 3  # Wymagana si³a has³a

def generate_otp_secret():
    totp = pyotp.TOTP(pyotp.random_base32())
    secret = totp.secret
    return secret

def verify_otp(secret, otp):
    totp = pyotp.TOTP(secret)
    return totp.verify(otp) 
