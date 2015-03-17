"""
Forms to support third-party to first-party OAuth 2.0 access token exchange
"""
from third_party_auth import pipeline
from third_party_auth.forms import ThirdPartyAccessTokenForm


class AccessTokenExchangeForm(ThirdPartyAccessTokenForm):
    """Form for access token exchange endpoint"""
    THIRD_PARTY_AUTH_ENTRY_TYPE = pipeline.AUTH_ENTRY_LOGIN_API
