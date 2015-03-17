"""
Forms to support third-party to first-party OAuth 2.0 access token exchange
"""
from third_party_auth import pipeline
from third_party_auth.forms import ThirdPartyAccessTokenForm


class AccessTokenExchangeForm(ThirdPartyAccessTokenForm):
    """Form for access token exchange endpoint"""
    def get_auth_entry_value(self):
        return pipeline.AUTH_ENTRY_LOGIN_API
