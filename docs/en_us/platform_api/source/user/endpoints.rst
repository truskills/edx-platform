################################################
edX Platform User API Endpoints
################################################

The edX Platform User API enables you to view information about users update your own account.

The following tasks and endpoints are currently supported. 

.. list-table::
   :widths: 10 70
   :header-rows: 1

   * - To:
     - Use this endpoint:
   * - :ref:`Get a user's account information <Get and Update the User's
       Account Information>`
     - GET /api/user/v0/accounts/{username}/[?view=shared]
   * - :ref:`Update your account information <Get and Update the User's Account
       Information>`
     - PATCH /api/user/v0/accounts/{username}/{“key”:”value”} “application
       /merge-patch+json”
