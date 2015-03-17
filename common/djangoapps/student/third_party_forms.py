"""
Forms for validating third party authentication data.
"""
from third_party_auth import pipeline
from third_party_auth.forms import ThirdPartyAccessTokenForm


class ThirdPartyAccountCreationForm(ThirdPartyAccessTokenForm):
    """
    A form for account creation with a third party access token.
    It is currently only used for validation, not rendering.
    """
    def get_auth_entry_value(self):
        return pipeline.AUTH_ENTRY_REGISTER_API
