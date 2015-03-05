from xblock.fields import Scope, String, XBlockMixin

# Make '_' a no-op so we can scrape strings
_ = lambda text: text


class LicenseMixin(XBlockMixin):
    """
    Mixin that allows an author to mark a block has having a non-default license.
    """
    license = String(
        display_name=_("License"),
        help=_("A license defines how the contents of this block can be shared and reused."),
        default=None,
        scope=Scope.settings
    )
